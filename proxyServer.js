const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000; // You can use any port you prefer

app.use(cors());
app.use(bodyParser.json());

app.post('/start', async (req, res) => {
    console.log('Received request to /start with body:', req.body);
    try {
        const response = await fetch('http://localhost:5000/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        console.log('Response from target server:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching from target server:', error);
        res.status(500).json({ error: 'Failed to fetch from target server' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});