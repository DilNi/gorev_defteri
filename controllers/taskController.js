const Task = require('../models/Task');

// Görevleri listele
exports.getTasks = (req, res) => {
  Task.find({ user: req.user._id })
    .then(tasks => {
      res.render('tasks', { tasks });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Sunucu hatası');
    });
};

// Görev ekleme formunu göster
exports.showCreateForm = (req, res) => {
  res.render('createTask');
};

// Yeni görev oluştur
exports.createTask = (req, res) => {
  const { taskName, description, priority } = req.body;
  const task = new Task({ taskName, description, priority, user: req.user._id });

  task.save()
    .then(() => {
      res.redirect('/tasks');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Sunucu hatası');
    });
};

// Görevi sil
exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  Task.findOneAndDelete({ _id: taskId, user: req.user._id })
    .then(() => {
      res.redirect('/tasks');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Sunucu hatası');
    });
};
