const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const apiRoutes = require('./backend/routes/apiRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json());


app.use(session({
    secret: process.env.SESSION_SECRET || 'marketing-os-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));


const MOCK_USER = {
    email: 'admin@marketingos.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'Arnav Kumar'
};


app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === MOCK_USER.email && bcrypt.compareSync(password, MOCK_USER.password)) {
        req.session.user = { email: MOCK_USER.email, name: MOCK_USER.name };
        return res.json({ success: true, user: req.session.user });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        return res.json({ authenticated: true, user: req.session.user });
    }
    res.json({ authenticated: false });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


app.use('/api', apiRoutes);


app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
