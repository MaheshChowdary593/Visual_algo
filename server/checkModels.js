require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No GEMINI_API_KEY found');
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log('--- AVAILABLE MODELS ---');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(m.name.split('/').pop());
                }
            });
        } else {
            console.error('No models found in response:', data);
        }
    } catch (err) {
        console.error('Error fetching models:', err);
    }
}

checkModels();
