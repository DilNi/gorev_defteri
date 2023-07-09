const User = require('../models/User');

// Kullanıcı kaydı formunu göster
exports.showRegisterForm = (req, res) => {
  res.render('register');
};

// Kullanıcı kaydını işle
exports.registerUser = (req, res) => {
  const { name, username, email, password } = req.body;
  const user = new User({ name, username, email, password });

  user.save()
    .then(() => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Sunucu hatası');
    });
};
