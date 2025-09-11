import { app } from 'egg-mock/bootstrap';
import assert from 'assert';

describe('GET /hello/user', () => {
  it('should return user profile json', async () => {
    const res = await app.httpRequest().get('/hello/user').query({ name: 'u1' }).expect(200);
    assert.strictEqual(res.body.user, 'u1');
    assert.strictEqual(res.body.level, 'basic');
  });
});