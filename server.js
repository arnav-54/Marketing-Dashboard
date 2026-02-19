const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const apiRoutes = require('./backend/routes/apiRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());


app.use(session({
    secret: process.env.SESSION_SECRET || 'marketing-os-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));


const authRoutes = require('./backend/routes/authRoutes');
const tutorialRoutes = require('./backend/routes/tutorialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tutorial', tutorialRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'MarketingOS API is running...' });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
