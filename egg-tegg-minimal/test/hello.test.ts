import { app } from 'egg-mock/bootstrap';
import assert from 'assert';

describe('GET /hello', () => {
  it('should return greeting json', async () => {
    const res = await app.httpRequest().get('/hello').query({ name: 'tegg' }).expect(200);
    assert.strictEqual(res.body.message, 'hello, tegg');
    assert.strictEqual(typeof res.body.count, 'number');
  });
});