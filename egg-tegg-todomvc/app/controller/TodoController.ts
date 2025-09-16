import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, HTTPParam, Inject, Context } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';
import { TodoService, TodoItem } from '../modules/todo/TodoService';

@HTTPController({ path: '/api/todos' })
export class TodoController {
  @Inject()
  private todoService: TodoService;

  // GET /api/todos
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async list() {
    return await this.todoService.list();
  }

  // POST /api/todos  body: { title }
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '' })
  async create(@Context() ctx: EggContext, @HTTPBody() body: { title?: string }) {
    const title = (body?.title || '').trim();
    if (!title) {
      ctx.status = 400;
      return { ok: false, message: 'title is required' };
    }
    const created = await this.todoService.create(title);
    ctx.status = 201;
    return created;
  }

  // PUT /api/todos/:id  body: { title?, completed? }
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id' })
  async update(
    @Context() ctx: EggContext,
    @HTTPParam() id: string,
    @HTTPBody() body: Partial<Omit<TodoItem, 'id'>>,
  ) {
    const patch: Partial<Omit<TodoItem, 'id'>> = {};
    if (typeof body?.title === 'string') patch.title = body.title.trim();
    if (typeof body?.completed === 'number') patch.completed = body.completed;

    const updated = await this.todoService.update(id, patch);
    if (!updated) {
      ctx.status = 404;
      return { ok: false, message: 'not found' };
    }
    return updated;
  }

  // DELETE /api/todos/:id
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '/:id' })
  async remove(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const ok = await this.todoService.remove(id);
    if (!ok) {
      ctx.status = 404;
      return { ok: false, message: 'not found' };
    }
    ctx.status = 204;
    return '';
  }

  // POST /api/todos/toggle-all  body: { completed }
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/toggle-all' })
  async toggleAll(@HTTPBody() body: { completed: number }) {
    const todos = await this.todoService.list();
    const promises = todos.map(todo => 
      this.todoService.update(todo.id, { completed: body.completed })
    );
    await Promise.all(promises);
    return await this.todoService.list();
  }

  // DELETE /api/todos/completed
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '/completed' })
  async clearCompleted() {
    await this.todoService.clear();
    return await this.todoService.list();
  }
}