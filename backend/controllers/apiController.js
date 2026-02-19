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
        const { month, channel } = req.query;
        console.log("getSummary params:", req.query);

        try {
            let data = {};

            if (month || channel) {
                let query = `
                    SELECT 
                        SUM(spend) as total_spend, 
                        SUM(revenue) as total_revenue, 
                        SUM(conversions) as total_conversions,
                        SUM(clicks) as total_clicks
                    FROM marketing_data 
                    WHERE 1=1
                `;
                const params = [];
                if (month) {
                    query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
                    params.push(month);
                }
                if (channel) {
                    query += " AND channel = ?";
                    params.push(channel);
                }

                const [rows] = await pool.query(query, params);
                const row = rows[0];

                data = {
                    total_spend: parseFloat(row.total_spend || 0),
                    total_revenue: parseFloat(row.total_revenue || 0),
                    total_conversions: parseInt(row.total_conversions || 0),
                    total_clicks: parseInt(row.total_clicks || 0)
                };

            } else {
                const [rows] = await pool.query('SELECT SUM(total_spend) as total_spend, SUM(total_revenue) as total_revenue, SUM(total_conversions) as total_conversions FROM channels');
                const row = rows[0];
                data = {
                    total_spend: parseFloat(row.total_spend || 0),
                    total_revenue: parseFloat(row.total_revenue || 0),
                    total_conversions: parseInt(row.total_conversions || 0),
                };
            }

            const total_spend = data.total_spend;
            const total_revenue = data.total_revenue;
            const conversions = data.total_conversions;

            const roas = total_spend > 0 ? (total_revenue / total_spend).toFixed(2) : 0;
            const cpa = conversions > 0 ? (total_spend / conversions).toFixed(2) : 0;

            let cpc = 0;
            if ((month || channel) && data.total_clicks > 0) {
                cpc = (total_spend / data.total_clicks).toFixed(2);
            } else {
                const cache = getCachedData();
                cpc = cache && cache.overall ? cache.overall.overall_cpc : 0;
            }

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

            if (channel && !month) {
                try {
                    const [rows] = await pool.query('SELECT SUM(total_spend) as total_spend, SUM(total_revenue) as total_revenue, SUM(total_conversions) as total_conversions FROM channels WHERE name = ?', [channel]);
                    if (rows && rows.length > 0 && rows[0].total_spend) {
                        const row = rows[0];
                        return res.json({
                            total_spend: parseFloat(row.total_spend || 0),
                            total_revenue: parseFloat(row.total_revenue || 0),
                            total_conversions: parseInt(row.total_conversions || 0),
                            overall_roas: row.total_spend > 0 ? (row.total_revenue / row.total_spend).toFixed(2) : 0,
                            overall_cpa: parseInt(row.total_conversions) > 0 ? (row.total_spend / row.total_conversions).toFixed(2) : 0,
                            overall_cpc: 0
                        });
                    }
                } catch (fallbackErr) {
                    console.warn("Static fallback filtering failed:", fallbackErr.message);
                }
            }

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
        const { sort_by = 'roas', order = 'desc', month, channel, min_roas, max_roas } = req.query;

        try {
            let rows;
            if (month) {
                const query = `
                    SELECT 
                        channel as name, 
                        SUM(spend) as total_spend, 
                        SUM(revenue) as total_revenue, 
                        SUM(conversions) as total_conversions,
                        SUM(clicks) as clicks
                    FROM marketing_data 
                    WHERE DATE_FORMAT(date, '%Y-%m') = ? 
                    GROUP BY channel
                `;
                const [results] = await pool.query(query, [month]);
                rows = results.map(r => ({
                    ...r,
                    roas: r.total_spend > 0 ? (r.total_revenue / r.total_spend).toFixed(2) : 0,
                    cpa: r.total_conversions > 0 ? (r.total_spend / r.total_conversions).toFixed(2) : 0,
                    cpc: r.clicks > 0 ? (r.total_spend / r.clicks).toFixed(2) : 0
                }));
            } else {
                const [results] = await pool.query('SELECT * FROM channels');
                rows = results;
            }

            if (channel) {
                rows = rows.filter(r => r.name === channel);
            }
            if (min_roas) {
                rows = rows.filter(r => parseFloat(r.roas) >= parseFloat(min_roas));
            }
            if (max_roas) {
                rows = rows.filter(r => parseFloat(r.roas) <= parseFloat(max_roas));
            }

            if (!rows.length) return res.json([]);

            rows.sort((a, b) => {
                let valA = a[sort_by] !== undefined ? parseFloat(a[sort_by]) : a[sort_by];
                let valB = b[sort_by] !== undefined ? parseFloat(b[sort_by]) : b[sort_by];

                if (sort_by === 'name') {
                    valA = (a.name || '').toLowerCase();
                    valB = (b.name || '').toLowerCase();
                    if (order === 'asc') return valA > valB ? 1 : -1;
                    return valA < valB ? 1 : -1;
                }

                if (isNaN(valA)) valA = 0;
                if (isNaN(valB)) valB = 0;

                if (order === 'asc') return valA - valB;
                return valB - valA;
            });

            return res.json(rows);

        } catch (dbErr) {
            console.warn("DB Connection failed, using JSON fallback for Channels.", dbErr.message);
            const cache = getCachedData();
            if (cache && cache.channels) {
                let mapped = cache.channels.map(c => ({
                    name: c.channel,
                    total_spend: c.spend,
                    total_revenue: c.revenue,
                    total_conversions: c.conversions,
                    roas: c.roas,
                    cpa: c.cpa,
                    cpc: c.cpc
                }));

                if (channel) mapped = mapped.filter(r => r.name === channel);
                if (min_roas) mapped = mapped.filter(r => parseFloat(r.roas) >= parseFloat(min_roas));
                if (max_roas) mapped = mapped.filter(r => parseFloat(r.roas) <= parseFloat(max_roas));

                mapped.sort((a, b) => {
                    let valA = a[sort_by] !== undefined ? parseFloat(a[sort_by]) : a[sort_by];
                    let valB = b[sort_by] !== undefined ? parseFloat(b[sort_by]) : b[sort_by];

                    if (sort_by === 'name') {
                        valA = (a.name || '').toLowerCase();
                        valB = (b.name || '').toLowerCase();
                        if (order === 'asc') return valA > valB ? 1 : -1;
                        return valA < valB ? 1 : -1;
                    }

                    if (isNaN(valA)) valA = 0;
                    if (isNaN(valB)) valB = 0;

                    if (order === 'asc') return valA - valB;
                    return valB - valA;
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
        const { month, channel } = req.query;
        try {
            let rows;
            if (channel) {
                const query = `
                    SELECT 
                        DATE_FORMAT(date, '%Y-%m') as month,
                        SUM(spend) as total_spend, 
                        SUM(revenue) as total_revenue, 
                        SUM(conversions) as total_conversions
                    FROM marketing_data 
                    WHERE channel = ?
                    GROUP BY month
                    ORDER BY month ASC
                `;
                const [results] = await pool.query(query, [channel]);

                rows = results.map(r => ({
                    month: r.month,
                    total_spend: parseFloat(r.total_spend || 0),
                    total_revenue: parseFloat(r.total_revenue || 0),
                    total_conversions: parseInt(r.total_conversions || 0),
                    roas: r.total_spend > 0 ? (r.total_revenue / r.total_spend).toFixed(2) : 0
                }));
            } else {
                let query = 'SELECT * FROM monthly_performance';
                let params = [];
                if (month && !channel) {
                    query += ' WHERE month = ?';
                    params.push(month);
                }
                query += ' ORDER BY month ASC';

                const [results] = await pool.query(query, params);
                rows = results.map(r => ({
                    month: r.month,
                    total_spend: parseFloat(r.total_spend || 0),
                    total_revenue: parseFloat(r.total_revenue || 0),
                    total_conversions: parseInt(r.total_conversions || 0),
                    roas: r.roas
                }));
            }

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
        const { channel, min_roas, max_roas, month } = req.query;

        try {
            let rows;
            if (month) {
                let query = `
                    SELECT 
                        campaign_name, 
                        channel as channel_name,
                        SUM(spend) as total_spend, 
                        SUM(revenue) as total_revenue, 
                        SUM(conversions) as conversions
                    FROM marketing_data 
                    WHERE DATE_FORMAT(date, '%Y-%m') = ?
                `;
                const params = [month];

                if (channel) {
                    query += ' AND channel = ?';
                    params.push(channel);
                }

                query += ' GROUP BY campaign_name, channel';

                const [results] = await pool.query(query, params);
                rows = results.map(r => ({
                    ...r,
                    roas: r.total_spend > 0 ? (r.total_revenue / r.total_spend).toFixed(2) : 0
                }));
            } else {
                let query = 'SELECT * FROM campaigns WHERE 1=1';
                let params = [];
                if (channel) {
                    query += ' AND channel_name = ?';
                    params.push(channel);
                }
                query += ' ORDER BY roas DESC';
                const [results] = await pool.query(query, params);
                rows = results;
            }

            if (min_roas) rows = rows.filter(c => parseFloat(c.roas) >= parseFloat(min_roas));
            if (max_roas) rows = rows.filter(c => parseFloat(c.roas) <= parseFloat(max_roas));

            rows.sort((a, b) => parseFloat(b.roas) - parseFloat(a.roas));

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
