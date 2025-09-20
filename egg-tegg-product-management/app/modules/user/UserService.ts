import { SingletonProto, AccessLevel, Inject } from '@eggjs/tegg';
import { User, UserRole } from './model/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'consumer' | 'merchant' | 'admin';
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  @Inject()
  User: typeof User;
  async register(data: RegisterData) {
    const { username, email, password, role = 'consumer' } = data;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role as UserRole,
      status: 1,
    });

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'egg-tegg-product-management-jwt-secret',
      { expiresIn: '24h' }
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      token
    };
  }

  async login(data: LoginData) {
    const { username, password } = data;
    
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.status === 0) {
      throw new Error('用户已被封禁');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'egg-tegg-product-management-jwt-secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }

  async loginByEmail(data: { email: string; password: string }) {
    const { email, password } = data;
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.status === 0) {
      throw new Error('用户已被封禁');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'egg-tegg-product-management-jwt-secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, 'egg-tegg-product-management-jwt-secret');
    } catch (error) {
      throw new Error('无效的token');
    }
  }

  async getUserById(id: string) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      created_at: user.created_at
    };
  }

  async getUserList(page: number = 1, pageSize: number = 10, filters: UserFilters = {}) {
    const offset = (page - 1) * pageSize;
    const whereConditions: any = {};
    
    if (filters.role) {
      whereConditions.role = filters.role;
    }
    
    if (filters.status) {
      whereConditions.status = filters.status === 'active' ? 1 : 0;
    }

    const [totalRaw, users] = await Promise.all([
      User.find(whereConditions as any).count(),
      User.find(whereConditions as any)
        .order('created_at', 'desc')
        .limit(pageSize)
        .offset(offset) as unknown as Promise<User[]>
    ]);

    const total = Array.isArray(totalRaw)
      ? Number((totalRaw as any)[0]?.count ?? 0)
      : Number(totalRaw);

    return {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        created_at: user.created_at
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async updateUser(id: string, data: Partial<RegisterData & { status: string }>) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('用户不存在');
    }

    const updateData: any = {};
    
    if (data.username) {
      const existingUser = await User.findOne({ username: data.username });
      if (existingUser && existingUser.id !== id) {
        throw new Error('用户名已存在');
      }
      updateData.username = data.username;
    }

    if (data.email) {
      const existingEmail = await User.findOne({ email: data.email });
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('邮箱已存在');
      }
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.role) {
      updateData.role = data.role;
    }

    if (data.status) {
      updateData.status = data.status === 'active' ? 1 : 0;
    }

    await user.update(updateData);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      created_at: user.created_at
    };
  }

  async deleteUser(id: string) {
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.remove();
    return { message: '用户删除成功' };
  }

  async banUser(id: string) {
    return this.updateUser(id, { status: 'banned' });
  }

  async unbanUser(id: string) {
    return this.updateUser(id, { status: 'active' });
  }
}

export default UserService;