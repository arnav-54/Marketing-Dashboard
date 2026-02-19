const db = require('../config/database');

exports.getStatus = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [rows] = await db.execute('SELECT tutorial_seen FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ tutorialSeen: rows[0].tutorial_seen === 1 });
    } catch (err) {
        console.error('Error fetching tutorial status:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.complete = async (req, res) => {
    try {
        const userId = req.session.user.id;
        await db.execute('UPDATE users SET tutorial_seen = TRUE WHERE id = ?', [userId]);
        res.json({ success: true, message: 'Tutorial marked as complete' });
    } catch (err) {
        console.error('Error completing tutorial:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
