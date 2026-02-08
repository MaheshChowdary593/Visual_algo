const { processDSAQuery } = require('./server/llmService');
require('dotenv').config({ path: './server/.env' });

async function test() {
    try {
        console.log("Testing Mistral API...");
        const result = await processDSAQuery("Explain bubble sort");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test Error:", error);
    }
}

test();
