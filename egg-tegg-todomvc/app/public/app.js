async function api(path, options = {}) {
  const res = await fetch('/api/todos' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  return await res.json();
}

async function render() {
  const list = await api('', { method: 'GET' });
  const ul = document.getElementById('todo-list');
  ul.innerHTML = '';
  let left = 0;
  list.forEach(item => {
    if (!item.completed) left++;
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'toggle';
    checkbox.checked = !!item.completed;
    checkbox.addEventListener('change', async () => {
      await api('/' + item.id, { method: 'PUT', body: JSON.stringify({ completed: checkbox.checked ? 1 : 0 }) });
      render();
    });

    const span = document.createElement('span');
    span.className = 'title';
    span.textContent = item.title;
    span.contentEditable = 'true';
    span.addEventListener('blur', async () => {
      const title = span.textContent.trim();
      if (!title) {
        await api('/' + item.id, { method: 'PUT', body: JSON.stringify({ title: item.title }) });
        span.textContent = item.title;
      } else if (title !== item.title) {
        await api('/' + item.id, { method: 'PUT', body: JSON.stringify({ title }) });
        render();
      }
    });

    const destroy = document.createElement('button');
    destroy.className = 'destroy';
    destroy.textContent = '×';
    destroy.addEventListener('click', async () => {
      await api('/' + item.id, { method: 'DELETE' });
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(destroy);
    ul.appendChild(li);
  });
  document.getElementById('todo-count').innerHTML = `<strong>${left}</strong> items left`;
  document.getElementById('toggle-all').checked = list.length > 0 && list.every(i => i.completed);
}

async function main() {
  const input = document.getElementById('new-todo');
  input.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const title = input.value.trim();
      if (!title) return;
      await api('', { method: 'POST', body: JSON.stringify({ title }) });
      input.value = '';
      render();
    }
  });

  document.getElementById('toggle-all').addEventListener('change', async (e) => {
    await api('/toggle-all', { method: 'POST', body: JSON.stringify({ completed: e.target.checked ? 1 : 0 }) });
    render();
  });

  document.getElementById('clear-completed').addEventListener('click', async () => {
    await api('/completed', { method: 'DELETE' });
    render();
  });

  await render();
}

main();