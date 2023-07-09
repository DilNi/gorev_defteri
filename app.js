// Gerekli modüllerin yüklenmesi
const http = require("http");
const path = require("path");
const rootDir = require("./util/path");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');


// Express uygulamasının oluşturulması
const app = express();

// EJS şablon motorunu kullanmak için yapılandırma
app.set('view engine', 'ejs');

// body-parser'ın yapılandırılması
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// express-session'ın yapılandırılması
app.use(session({
  secret: 'gizli_anahtar',
  resave: true,
  saveUninitialized: true
}));

// connect-flash'ın yapılandırılması
app.use(flash());





// MongoDB bağlantısı
mongoose.connect('mongodb+srv://Yagmur:saydam14@cluster0.3qhe1pz.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB bağlantısı başarılı!');
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Kullanıcı modeli
const User = require('./models/Users');
const Task = require('./models/Task');

// Ana sayfa
app.get('/', (req, res) => {
  res.render('index', { message: req.flash('message') });
});

// Kayıt sayfası
app.get('/register', (req, res) => {
  res.render('register', { message: req.flash('message') });
});

// Kayıt işlemi
app.post('/register', (req, res) => {
  const { name, email, username, password } = req.body;

  const newUser = new User({
    name,
    email,
    username,
    password
  });

  newUser.save()
    .then(() => {
      req.flash('message', 'Kayıt başarıyla tamamlandı. Giriş yapabilirsiniz.');
      res.redirect('/login');
    })
    .catch(err => {
      console.error('Kayıt hatası:', err);
      req.flash('message', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/register');
    });
});

// Giriş sayfası
app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('message') });
});

// Giriş işlemi
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then(user => {
      if (!user || user.password !== password) {
        req.flash('message', 'Geçersiz kullanıcı adı veya şifre.');
        res.redirect('/login');
      } else {
        req.session.user = user;
        res.redirect('/tasks');
      }
    })
    .catch(err => {
      console.error('Giriş hatası:', err);
      req.flash('message', 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/login');
    });
});

// Çıkış işlemi
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Görevler sayfası
app.get('/tasks', (req, res) => {
  if (!req.session.user) {
    req.flash('message', 'Önce giriş yapmalısınız.');
    res.redirect('/login');
    return;
  }

  Task.find({ user: req.session.user._id })
    .then(tasks => {
      res.render('tasks', { user: req.session.user, tasks, message: req.flash('message') });
    })
    .catch(err => {
      console.error('Görev çekme hatası:', err);
      req.flash('message', 'Görevleri çekerken bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/tasks');
    });
});

// Görev ekleme işlemi
app.post('/tasks', (req, res) => {
  if (!req.session.user) {
    req.flash('message', 'Önce giriş yapmalısınız.');
    res.redirect('/login');
    return;
  }

  const { taskName, description, priority } = req.body;

  const newTask = new Task({
    taskName,
    description,
    priority,
    user: req.session.user._id
  });

  newTask.save()
    .then(() => {
      req.flash('message', 'Görev başarıyla eklendi.');
      res.redirect('/tasks');
    })
    .catch(err => {
      console.error('Görev ekleme hatası:', err);
      req.flash('message', 'Görev eklerken bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/tasks');
    });
});

// Görev silme işlemi
app.post('/tasks/delete/:id', (req, res) => {
  if (!req.session.user) {
    req.flash('message', 'Önce giriş yapmalısınız.');
    res.redirect('/login');
    return;
  }

  const taskId = req.params.id;

  Task.findOneAndDelete({ _id: taskId, user: req.session.user._id })
    .then(() => {
      req.flash('message', 'Görev başarıyla silindi.');
      res.redirect('/tasks');
    })
    .catch(err => {
      console.error('Görev silme hatası:', err);
      req.flash('message', 'Görev silerken bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/tasks');
    });
});

// Görev güncelleme işlemi
app.post('/tasks/update/:id', (req, res) => {
  if (!req.session.user) {
    req.flash('message', 'Önce giriş yapmalısınız.');
    res.redirect('/login');
    return;
  }

  const taskId = req.params.id;
  const { taskName, description, priority } = req.body;

  Task.findOneAndUpdate(
    { _id: taskId, user: req.session.user._id },
    { taskName, description, priority },
    { new: true }
  )
    .then(task => {
      if (!task) {
        req.flash('message', 'Görev bulunamadı veya güncelleme yetkiniz yok.');
        res.redirect('/tasks');
        return;
      }

      req.flash('message', 'Görev başarıyla güncellendi.');
      res.redirect('/tasks');
    })
    .catch(err => {
      console.error('Görev güncelleme hatası:', err);
      req.flash('message', 'Görev güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      res.redirect('/tasks');
    });
});

// Sunucunun dinlemeye başlaması
app.listen(3000, () => {
  console.log('Sunucu çalışıyor: http://localhost:3000');
});
