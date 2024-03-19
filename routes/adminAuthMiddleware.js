//saf3479frhw9348fsa

const bcrypt = require('bcrypt');

// Replace 'hashedPassword' with the hashed password you want to use
const hashedPassword = '$2b$10$6YodZ9gBL0JzGHzngaPgKu/S4o6Y2VxHrs8.BuEiWB0eCpP5EjMVC';

function authenticateAdmin(req, res, next) {
  const { password } = req.body;

  if (!password) {
    return res.status(401).json({ error: 'Password is required' });
  }

  bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    next();
  });
}

module.exports = authenticateAdmin;
/*
const bcrypt = require('bcrypt');
const saltRounds = 10;

const plainPassword = 'saf3479frhw9348fsa';
console.log(plainPassword);

bcrypt.genSalt(saltRounds, function(err, salt) {
  if (err) {
    return;
  }

  bcrypt.hash(plainPassword, salt, function(err, hash) {
    if (err) {
      return;
    }

    console.log('Hashed Password:', hash);
  });
});

*/