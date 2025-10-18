const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database');
const router = express.Router();

const JWT_SECRET = 'your-secret-key';

// Register
router.post('/register', (req, res) => {
  const { username, password, email, fullname, phone, address } = req.body;
  
  // Validate required fields
  if (!username || !password || !email || !fullname) {
    console.log('Missing fields:', { username: !!username, password: !!password, email: !!email, fullname: !!fullname });
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  console.log('Registration data received:', { username, email, fullname });
  
  db.run(
    `INSERT INTO users (username, password, email, fullname, phone, address) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, email, fullname, phone || null, address || null],
    function(err) {
      if (err) {
        console.error('Registration error:', err);
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.json({ message: 'User registered successfully', userId: this.lastID });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          fullname: user.fullname,
          role: user.role 
        } 
      });
    }
  );
});

// Get profile
router.get('/profile/:userId', (req, res) => {
  db.get(
    'SELECT id, username, email, fullname, phone, address, role FROM users WHERE id = ?',
    [req.params.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update profile
router.put('/profile/:userId', (req, res) => {
  const updates = req.body;
  const allowedFields = ['email', 'fullname', 'phone', 'address', 'password'];
  
  // Build dynamic query
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  values.push(req.params.userId);
  
  db.run(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Update failed' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

module.exports = router;