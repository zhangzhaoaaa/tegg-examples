#!/usr/bin/env node
// 初始化 SQLite 数据库与表结构（使用 better-sqlite3 执行 DDL）
// 运行：npm run init:db

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

(() => {
  try {
    const runDir = path.resolve(__dirname, '../run');
    if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });

    const dbFile = path.resolve(runDir, 'todos.sqlite');
    const db = new Database(dbFile);

    // 与 app/modules/todo/model/Todo.ts 对齐
    // id: string 主键；title: string 非空；completed: integer(0/1) 非空
    // created_at/updated_at 与 config.default.ts 的 define 保持一致
    db.exec(`
      CREATE TABLE IF NOT EXISTS "todos" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      );
      CREATE TRIGGER IF NOT EXISTS todos_updated_at
      AFTER UPDATE ON todos
      FOR EACH ROW BEGIN
        UPDATE todos SET updated_at = datetime('now') WHERE id = OLD.id;
      END;
    `);

    console.log(`[init-db] OK - sqlite at ${dbFile}`);
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('[init-db] FAILED:', err && err.stack || err);
    process.exit(1);
  }
})();