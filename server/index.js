const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { processDSAQuery } = require('./llmService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('DSA Visualizer API is running');
});

app.post('/api/process-query', async (req, res) => {
    const { query, history } = req.body;
    console.log('Received query:', query, 'History length:', history?.length || 0);

    try {
        const result = await processDSAQuery(query, history);
        res.json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to process query' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
