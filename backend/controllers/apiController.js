const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const getCachedData = () => {
    try {
        const jsonPath = path.join(__dirname, '../../data/summary_data.json');
        if (fs.existsSync(jsonPath)) {
            const fileData = fs.readFileSync(jsonPath, 'utf8');
            return JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Error reading cache:', err);
    }
    return null;
};

exports.getSummary = async (req, res) => {
    try {
        try {
            const [rows] = await pool.query('SELECT SUM(total_spend) as total_spend, SUM(total_revenue) as total_revenue, SUM(total_conversions) as total_conversions FROM channels');
            const data = rows[0];

            if (!data.total_spend) throw new Error("DB empty or failed");

            const total_spend = parseFloat(data.total_spend || 0);
            const total_revenue = parseFloat(data.total_revenue || 0);
            const conversions = parseInt(data.total_conversions || 0);

            const roas = total_spend > 0 ? (total_revenue / total_spend).toFixed(2) : 0;
            const cpa = conversions > 0 ? (total_spend / conversions).toFixed(2) : 0;

            const cache = getCachedData();
            const cpc = cache && cache.overall ? cache.overall.overall_cpc : 0;

            return res.json({
                total_spend: total_spend,
                total_revenue: total_revenue,
                total_conversions: conversions,
                overall_roas: roas,
                overall_cpa: cpa,
                overall_cpc: cpc
            });

        } catch (dbErr) {
            console.warn("DB Connection failed or empty, using JSON fallback for Summary.", dbErr.message);
            const cache = getCachedData();
            if (cache && cache.overall) {
                return res.json(cache.overall);
            }
            throw dbErr;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error / No Data' });
    }
};

exports.getChannels = async (req, res) => {
    try {
        const { sort_by = 'roas', order = 'desc' } = req.query;

        try {
            const allowedCols = ['name', 'total_spend', 'total_revenue', 'total_conversions', 'roas', 'cpa', 'cpc'];
            let sortCol = allowedCols.includes(sort_by) ? sort_by : 'roas';
            const sortOrder = (order && order.toLowerCase() === 'asc') ? 'ASC' : 'DESC';

            const query = `SELECT * FROM channels ORDER BY ${sortCol} ${sortOrder}`;
            const [rows] = await pool.query(query);

            if (!rows.length) throw new Error("No channel rows");
            return res.json(rows);

        } catch (dbErr) {
            console.warn("DB Connection failed, using JSON fallback for Channels.", dbErr.message);
            const cache = getCachedData();
            if (cache && cache.channels) {
                const mapped = cache.channels.map(c => ({
                    name: c.channel,
                    total_spend: c.spend,
                    total_revenue: c.revenue,
                    total_conversions: c.conversions,
                    roas: c.roas,
                    cpa: c.cpa,
                    cpc: c.cpc
                }));
                mapped.sort((a, b) => {
                    let valA = a[sort_by] || 0;
                    let valB = b[sort_by] || 0;
                    if (sort_by === 'name') {
                        valA = a.name.toLowerCase();
                        valB = b.name.toLowerCase();
                    }
                    if (order === 'asc') return valA > valB ? 1 : -1;
                    return valA < valB ? 1 : -1;
                });

                return res.json(mapped);
            }
            throw dbErr;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMonthly = async (req, res) => {
    try {
        const { month } = req.query;
        try {
            let query = 'SELECT * FROM monthly_performance';
            let params = [];
            if (month) {
                query += ' WHERE month = ?';
                params.push(month);
            }
            query += ' ORDER BY month ASC';

            const [rows] = await pool.query(query, params);
            if (!rows.length && !month) throw new Error("No monthly rows");
            return res.json(rows);
        } catch (dbErr) {
            console.warn("DB Connection failed, using JSON fallback for Monthly.", dbErr.message);
            const cache = getCachedData();
            if (cache && cache.monthly) {
                let mapped = cache.monthly.map(m => ({
                    month: m.month,
                    total_spend: m.spend,
                    total_revenue: m.revenue,
                    total_conversions: m.conversions,
                    roas: m.roas
                }));

                if (month) {
                    mapped = mapped.filter(m => m.month === month);
                }
                mapped.sort((a, b) => a.month.localeCompare(b.month));

                return res.json(mapped);
            }
            throw dbErr;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCampaigns = async (req, res) => {
    try {
        const { channel, min_roas, max_roas } = req.query;

        try {
            let query = 'SELECT * FROM campaigns WHERE 1=1';
            let params = [];

            if (channel) {
                query += ' AND channel_name = ?';
                params.push(channel);
            }
            if (min_roas) {
                query += ' AND roas >= ?';
                params.push(min_roas);
            }
            if (max_roas) {
                query += ' AND roas <= ?';
                params.push(max_roas);
            }

            query += ' ORDER BY roas DESC';

            const [rows] = await pool.query(query, params);
            if (!rows.length && !channel && !min_roas) throw new Error("No campaign rows");
            return res.json(rows);
        } catch (dbErr) {
            console.warn("DB Connection failed, using JSON fallback for Campaigns.", dbErr.message);
            const cache = getCachedData();
            if (cache && cache.campaigns) {
                let mapped = cache.campaigns.map(c => ({
                    campaign_name: c.campaign,
                    channel_name: c.channel,
                    total_spend: c.spend,
                    total_revenue: c.revenue,
                    conversions: c.conversions,
                    roas: c.roas
                }));
                if (channel) mapped = mapped.filter(c => c.channel_name === channel);
                if (min_roas) mapped = mapped.filter(c => c.roas >= parseFloat(min_roas));
                if (max_roas) mapped = mapped.filter(c => c.roas <= parseFloat(max_roas));

                mapped.sort((a, b) => b.roas - a.roas);

                return res.json(mapped);
            }
            throw dbErr;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getInsights = async (req, res) => {
    try {
        const cache = getCachedData();
        if (cache && cache.insights) {
            return res.json(cache.insights);
        } else {
            return res.json(["No insights generated. Please run the python script."]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
