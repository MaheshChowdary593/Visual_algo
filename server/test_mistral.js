const { processDSAQuery } = require('./llmService');
require('dotenv').config();

async function test() {
    try {
        console.log("Testing Mistral API...");
        const result = await processDSAQuery("explain bucket sort");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test Error:", error);
    }
}

test();
