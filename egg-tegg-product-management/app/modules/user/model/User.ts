import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

export enum UserRole {
  ADMIN = 'admin',           // 系统管理员
  CONSUMER = 'consumer',     // 商品消费者
  OPERATOR = 'operator',     // 商品运营者
}

@Model()
export class User extends Bone {
  @Attribute(DataTypes.STRING as any, { primary: true })
  id: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false, unique: true })
  username: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false, unique: true })
  email: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false })
  password: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false })
  role: UserRole;

  @Attribute(DataTypes.STRING as any, { allowNull: true })
  avatar: string;

  @Attribute(DataTypes.INTEGER as any, { allowNull: false })
  status: number;

  @Attribute(DataTypes.DATE as any, { allowNull: false })
  created_at: Date;

  @Attribute(DataTypes.DATE as any, { allowNull: false })
  updated_at: Date;
}