const Database = require('better-sqlite3');

const createProjectsTableSQL = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`;

const createTasksTableSQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
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

      clearDatabase: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          database.prepare('DELETE FROM tasks').run();
          database.prepare('DELETE FROM projects').run();
        } else {
          console.warn('clearDatabase called outside of test environment. FIXME!');
        }
      },

      seedTestData: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          const insertProject = database.prepare(
            'INSERT INTO projects (name, description) VALUES (?, ?)'
          );
          const insertTask = database.prepare(
            'INSERT INTO tasks (project_id, title, status) VALUES (?, ?, ?)'
          );
          const seed = database.transaction(() => {
            const p1 = insertProject.run('Test Project Alpha', 'A sample test project').lastInsertRowid;
            const p2 = insertProject.run('Test Project Beta', 'Another sample project').lastInsertRowid;
            insertTask.run(p1, 'Write unit tests', 'open');
            insertTask.run(p1, 'Set up CI pipeline', 'complete');
            insertTask.run(p2, 'Design database schema', 'open');
          });
          seed();
          console.log('Seeding test data into database');
        } else {
          console.warn('seedTestData called outside of test environment. FIXME!');
        }
      },

      // --- Projects ---
      getAllProjects: () => {
        return database.prepare(`
          SELECT p.*,
            COUNT(t.id) AS task_count,
            SUM(CASE WHEN t.status = 'complete' THEN 1 ELSE 0 END) AS completed_count
          FROM projects p
          LEFT JOIN tasks t ON t.project_id = p.id
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `).all();
      },

      getProjectById: (id) => {
        return database.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      },

      createProject: (name, description) => {
        const info = database.prepare(
          'INSERT INTO projects (name, description) VALUES (?, ?)'
        ).run(name, description);
        return info.lastInsertRowid;
      },

      deleteProject: (id) => {
        const info = database.prepare('DELETE FROM projects WHERE id = ?').run(id);
        return info.changes;
      },

      // --- Tasks ---
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
        const info = database.prepare(
          "UPDATE tasks SET status = 'complete' WHERE id = ?"
        ).run(taskId);
        return info.changes;
      },

      deleteTask: (taskId) => {
        const info = database.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
        return info.changes;
      },

      getTotalProjects: () => {
        return database.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
      },
    }
  };
}

module.exports = { createDatabaseManager };
