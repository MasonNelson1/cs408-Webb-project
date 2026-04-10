const Database = require('better-sqlite3');

const createProjectsTableSQL = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

const createTasksTableSQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`;

function createDatabaseManager(dbPath) {
  const database = new Database(dbPath);
  console.log('Database manager created for:', dbPath);
  database.pragma('foreign_keys = ON');
  database.exec(createProjectsTableSQL);
  database.exec(createTasksTableSQL);

  function ensureConnected() {
    if (!database.open) {
      throw new Error('Database connection is not open');
    }
  }

  return {
    dbHelpers: {
      // ── Projects ──────────────────────────────────────────────
      getAllProjects: () => {
        return database.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
      },
      getProjectById: (id) => {
        return database.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      },
      createProject: (name, description) => {
        const info = database.prepare(
          'INSERT INTO projects (name, description) VALUES (?, ?)'
        ).run(name, description || '');
        return info.lastInsertRowid;
      },
      deleteProject: (id) => {
        database.prepare('DELETE FROM tasks WHERE project_id = ?').run(id);
        database.prepare('DELETE FROM projects WHERE id = ?').run(id);
      },

      // ── Tasks ─────────────────────────────────────────────────
      getTasksByProject: (projectId) => {
        return database.prepare(
          'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC'
        ).all(projectId);
      },
      createTask: (projectId, title) => {
        const info = database.prepare(
          'INSERT INTO tasks (project_id, title) VALUES (?, ?)'
        ).run(projectId, title);
        return info.lastInsertRowid;
      },
      completeTask: (taskId) => {
        database.prepare(
          "UPDATE tasks SET status = 'complete' WHERE id = ?"
        ).run(taskId);
      },
      deleteTask: (taskId) => {
        database.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
      },

      // ── Test helpers ──────────────────────────────────────────
      clearDatabase: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          database.prepare('DELETE FROM tasks').run();
          database.prepare('DELETE FROM projects').run();
        } else {
          console.warn('clearDatabase called outside of test environment.');
        }
      },
      seedTestData: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          const projId = database.prepare(
            'INSERT INTO projects (name, description) VALUES (?, ?)'
          ).run('Test Project', 'A seeded test project').lastInsertRowid;
          database.prepare(
            'INSERT INTO tasks (project_id, title) VALUES (?, ?)'
          ).run(projId, 'Sample task');
        } else {
          console.warn('seedTestData called outside of test environment.');
        }
      },
    }
  };
}

module.exports = { createDatabaseManager };
EOF
