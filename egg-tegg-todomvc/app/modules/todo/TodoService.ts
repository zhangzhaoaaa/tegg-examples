import { SingletonProto, Inject, AccessLevel } from '@eggjs/tegg';
import { Todo } from './model/Todo';

export interface TodoItem {
  id: string;
  title: string;
  completed: number;
}

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class TodoService {
  @Inject()
  Todo: typeof Todo;

  async list(): Promise<TodoItem[]> {
    const todos = await this.Todo.find({}).order('id', 'desc') as unknown as Todo[];
    return todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    }));
  }

  async create(title: string): Promise<TodoItem> {
    const id = Date.now().toString(); // 生成简单的 ID
    const todo = await this.Todo.create({
      id,
      title,
      completed: 0,
    } as any) as Todo;
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    };
  }

  async update(id: string, patch: Partial<TodoItem>): Promise<TodoItem | null> {
    const todo = await this.Todo.findOne({ id }) as Todo | null;
    if (!todo) {
      return null;
    }

    if (patch.title !== undefined) {
      todo.title = patch.title;
    }
    if (patch.completed !== undefined) {
      todo.completed = patch.completed;
    }

    await todo.save();
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    };
  }

  async remove(id: string): Promise<boolean> {
    const affected = await this.Todo.remove({ id } as any) as unknown as number;
    return affected > 0;
  }

  async clear(): Promise<number> {
    const affected = await this.Todo.remove({ completed: 1 } as any) as unknown as number;
    return affected;
  }
}