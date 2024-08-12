const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(bodyParser.json());

require('dotenv').config();
const mongoose = require('mongoose');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


mongoose.connect('xyz'});

// Step 2: Create User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Exercise Schema and Model
const exerciseSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);


// POST /api/users to create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  await newUser.save();
  res.json({ username: newUser.username, _id: newUser._id });
});

// GET /api/users to get a list of all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// POST /api/users/:_id/exercises to add an exercise to a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const exercise = new Exercise({
      username: user.username,
      _id: _id,
      description,
      duration,
      date: date ? new Date(date) : new Date()
    });

    await exercise.save();

    res.json({
      username: user.username,
      _id: user._id,
      exercise: exercise
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/users/:_id/logs to get a user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    let exercises = await Exercise.find({ _id: _id });

    if (from) {
      exercises = exercises.filter(ex => new Date(ex.date) >= new Date(from));
    }
    if (to) {
      exercises = exercises.filter(ex => new Date(ex.date) <= new Date(to));
    }
    if (limit) {
      exercises = exercises.slice(0, parseInt(limit));
    }
    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: log
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
