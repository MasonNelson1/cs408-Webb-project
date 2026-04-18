var express = require('express');
var router = express.Router();

/* GET landing page */
router.get('/', function (req, res) {
  res.render('index', { title: 'DevTrack' });
});

/* GET about page */
router.get('/about', function (req, res) {
  res.render('about', { title: 'About — DevTrack' });
});

/* GET all projects */
router.get('/projects', function (req, res) {
  const projects = req.db.getAllProjects();
  res.render('projects', { title: 'Projects — DevTrack', projects });
});

/* GET create project form */
router.get('/projects/new', function (req, res) {
  res.render('create-project', { title: 'New Project — DevTrack', error: null });
});

/* POST create project */
router.post('/projects', function (req, res) {
  const { name, description } = req.body;
  if (!name || name.trim() === '') {
    return res.render('create-project', {
      title: 'New Project — DevTrack',
      error: 'Project name is required.'
    });
  }
  req.db.createProject(name.trim(), (description || '').trim());
  res.redirect('/projects');
});

/* GET project detail */
router.get('/projects/:id', function (req, res) {
  const project = req.db.getProjectById(req.params.id);
  if (!project) return res.status(404).render('error', { message: 'Project not found', error: { status: 404 } });
  const tasks = req.db.getTasksByProject(project.id);
  res.render('project-detail', { title: `${project.name} — DevTrack`, project, tasks });
});

/* POST add task to project */
router.post('/projects/:id/tasks', function (req, res) {
  const project = req.db.getProjectById(req.params.id);
  if (!project) return res.status(404).render('error', { message: 'Project not found', error: { status: 404 } });
  const { title } = req.body;
  if (title && title.trim() !== '') {
    req.db.createTask(project.id, title.trim());
  }
  res.redirect(`/projects/${project.id}`);
});

/* POST complete a task */
router.post('/projects/:id/tasks/:taskId/complete', function (req, res) {
  req.db.completeTask(req.params.taskId);
  res.redirect(`/projects/${req.params.id}`);
});

/* POST delete a task */
router.post('/projects/:id/tasks/:taskId/delete', function (req, res) {
  req.db.deleteTask(req.params.taskId);
  res.redirect(`/projects/${req.params.id}`);
});

/* POST delete a project */
router.post('/projects/:id/delete', function (req, res) {
  const project = req.db.getProjectById(req.params.id);
  if (!project) return res.status(404).render('error', { message: 'Project not found', error: { status: 404 } });
  req.db.deleteProject(req.params.id);
  res.redirect('/projects');
});

module.exports = router;
