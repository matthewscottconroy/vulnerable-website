const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();

// Set up Handlebars as the template engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'vulnerable_secret',
    resave: false,
    saveUninitialized: true,
}));

// PostgreSQL database connection pool
const pool = new Pool({
    user: 'matthewconroy',
    host: 'localhost',
    database: 'vulnerable_db',
    password: 'password',
    port: 5432,
});

// Home route
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login route with SQL Injection vulnerability
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    pool.query(query, (err, result) => {
        if (result && result.rows.length > 0) {
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/profile');
        } else {
            res.send('Login failed');
        }
    });
});

// Comments route with XSS vulnerability
app.get('/comments', (req, res) => {
    res.render('comments', { comments: req.session.comments || [] });
});

app.post('/comments', (req, res) => {
    const { comment } = req.body;
    if (!req.session.comments) req.session.comments = [];
    req.session.comments.push(comment);
    res.redirect('/comments');
});

// Profile route with insecure session management
app.get('/profile', (req, res) => {
    if (req.session.loggedIn) {
        res.render('profile', { username: req.session.username });
    } else {
        res.send('Unauthorized access');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

