const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'green-themed-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour session
}));

// Admin credentials (as requested)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.redirect('/?error=unauthorized');
}

// Routes
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: ${username}`);
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    console.log('Login successful');
    req.session.authenticated = true;
    req.session.username = username;
    res.redirect('/dashboard');
  } else {
    console.log('Login failed');
    res.redirect('/?error=invalid');
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/sounds', (req, res) => {
  const soundsDir = path.join(__dirname, 'public', 'sounds');
  const fs = require('fs');
  
  fs.readdir(soundsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to list sounds' });
    }
    
    // Filter to only include audio files
    const sounds = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg'));
    
    res.json({ sounds });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});