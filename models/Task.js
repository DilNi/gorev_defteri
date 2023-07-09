const mongoose = require('mongoose');

// Task şeması
const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['yüksek', 'orta', 'düşük'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Task modeli
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
