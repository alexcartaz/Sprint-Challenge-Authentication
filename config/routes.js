const axios = require('axios');
const userDb = require('../database/user.js');

const bcrypt = require('bcryptjs');

const { authenticate, generateToken } = require('../auth/authenticate');

module.exports = (server) => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const { username, password } = req.body;
  const newUser = {
    username,
    password,
  };
  const hash = bcrypt.hashSync(newUser.password, 14);
  newUser.password = hash;
  userDb.insert(newUser)
    .then((id) => {
      res.status(201).json(id);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Error saving new user to database.' });
    });
};

function login(req, res) {
  // implement user login
  const user = req.body;
  userDb.getUserForLogin(user.username)
    .then((returnedUser) => {
      if (returnedUser && bcrypt.compareSync(user.password, returnedUser.password)) {
        const token = generateToken(user);
        res.status(201).json({ message: `Welcome ${user.username}`, token });
      } else {
        res.status(400).json({ error: 'Not authenticated.' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Error verifying user in database.' });
    });
};

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
