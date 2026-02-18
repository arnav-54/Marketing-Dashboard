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


const authRoutes = require('./backend/routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);


app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
