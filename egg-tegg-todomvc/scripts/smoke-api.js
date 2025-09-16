#!/usr/bin/env node
(async () => {
  const BASE = 'http://127.0.0.1:7001';
  const j = (o) => JSON.stringify(o, null, 2);
  const hdr = { 'content-type': 'application/json' };
  try {
    console.log('GET /api/todos ->');
    let res = await fetch(`${BASE}/api/todos`);
    let list = await res.json();
    console.log(j(list));
    console.log();

    console.log('POST /api/todos { title: "First Task" } ->');
    res = await fetch(`${BASE}/api/todos`, { method: 'POST', headers: hdr, body: JSON.stringify({ title: 'First Task' }) });
    let created = await res.json();
    console.log(j(created));
    console.log();

    const id = created && created.id;
    if (!id) throw new Error('No id returned from create');

    console.log(`PUT /api/todos/${id} { title: "First Task Updated", completed: true } ->`);
    res = await fetch(`${BASE}/api/todos/${id}`, { method: 'PUT', headers: hdr, body: JSON.stringify({ title: 'First Task Updated', completed: true }) });
    let updated = await res.json();
    console.log(j(updated));
    console.log();

    console.log('GET /api/todos ->');
    res = await fetch(`${BASE}/api/todos`);
    list = await res.json();
    console.log(j(list));
    console.log();

    console.log(`DELETE /api/todos/${id} ->`);
    res = await fetch(`${BASE}/api/todos/${id}`, { method: 'DELETE' });
    const removed = await res.json().catch(() => ({}));
    console.log(j(removed));
    console.log();

    console.log('GET /api/todos ->');
    res = await fetch(`${BASE}/api/todos`);
    list = await res.json();
    console.log(j(list));
    console.log();

    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err && err.stack || err);
    process.exit(1);
  }
})();