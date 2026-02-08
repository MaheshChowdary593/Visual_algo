const Mistral = require('@mistralai/mistralai');

let mistralInstance = null;

function getMistralClient() {
    if (mistralInstance) return mistralInstance;

    const key = process.env.MISTRAL_API_KEY;
    if (key && key !== 'your_mistral_api_key_here' && key.length > 10) {
        console.log(`[Mistral SDK] Initializing with key ending in ...${key.slice(-4)}`);
        // Handle both possible export patterns for the SDK
        const ClientClass = Mistral.default || Mistral;
        mistralInstance = new ClientClass(key);
        return mistralInstance;
    }
    console.warn('[Mistral SDK] No valid API key found in process.env');
    return null;
}

/**
 * Stage 2: Validator Layer
 * Ensures the JSON structure is correct and follows the expected schema.
 */
function validateVisualizationData(data) {
    if (!data || typeof data !== 'object') throw new Error("Output is not a valid object");
    if (!data.visualization) throw new Error("Missing 'visualization' field");

    const viz = data.visualization;
    const requiredFields = ['title', 'type', 'steps'];
    for (const field of requiredFields) {
        if (!viz[field]) throw new Error(`Missing required field: ${field}`);
    }

    if (!Array.isArray(viz.steps) || viz.steps.length === 0) {
        throw new Error("Visualization has no steps");
    }

    // Type-specific validation
    if (viz.type === 'tree') {
        viz.steps.forEach((step, idx) => {
            if (!Array.isArray(step.nodes)) throw new Error(`Step ${idx} in tree visualization is missing 'nodes' array`);
        });
    } else if (viz.type === 'array') {
        viz.steps.forEach((step, idx) => {
            if (!Array.isArray(step.state)) throw new Error(`Step ${idx} in array visualization is missing 'state' array`);
        });
    }

    return data;
}

/**
 * Extracts and parses JSON from a potentially messy AI response string.
 */
function extractJSON(text) {
    if (typeof text !== 'string') {
        if (typeof text === 'object' && text !== null) return text;
        throw new Error(`Expected string or object, got ${typeof text}`);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerError) {
                console.error("[llmService] Failed to parse extracted JSON block:", innerError.message);
            }
        }
        throw new Error("Invalid JSON format in AI response");
    }
}

/**
 * Stage 1: LLM Generation
 * Generates a step-by-step DSA visualization data and code using Mistral AI.
 */
async function processDSAQuery(query, history = []) {
    const mistral = getMistralClient();
    if (!mistral) {
        return getMockBubbleSort("Mistral API Key is missing. Ensure MISTRAL_API_KEY is set in server/.env");
    }

    const systemPrompt = `
You are a DSA expert. Provide a MODERATE, clear explanation for the given query.

RETURN ONLY A VALID JSON OBJECT.

FORMAT:
{
  "message": "# 💡 Main Explanation\nProvide a concise 1-2 paragraph description of the algorithm/concept.\n\n# 🏗️ Example\nA concrete example with a specific set of numbers or nodes.\n\n# 📊 Dry Run Output\nA high-level summary of the steps taken in the visualization.",
  "code": "A clean Java solution with helpful comments.",
  "visualization": {
    "title": "Algorithm Name",
    "description": "Short summary of this specific example.",
    "type": "array" | "tree" | "linked-list" | "queue" | "stack" | "graph" | "hashmap" | "recursion",
    "timeComplexity": "O(...)",
    "spaceComplexity": "O(...)",
    "steps": []
  }
}

--- EDUCATIONAL GUIDELINES ---
- Be concise but accurate. Avoid "clumsy" or overly long text.
- Use JAVA for code.
- Visualization must have meaningful steps that match the explanation.
`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.role === 'assistant' ? (msg.fullResponse || msg.text) : msg.text
        })),
        { role: "user", content: query }
    ];

    try {
        console.log(`[Mistral AI] Processing query for ultra-detailed explanation...`);

        const response = await mistral.chat({
            model: "mistral-large-latest",
            messages,
            responseFormat: { type: "json_object" },
            temperature: 0.3
        });

        const responseContent = response.choices[0].message.content;
        const parsed = extractJSON(responseContent);

        // Stage 2: Validation
        console.log(`[Mistral AI] Validating response...`);
        const validatedData = validateVisualizationData(parsed);

        console.log(`[Mistral AI] Success - Detailed response ready`);
        return validatedData;

    } catch (error) {
        console.error(`[Mistral AI] Pipeline Error:`, error.message);
        return getMockBubbleSort(`Mistral AI Error: ${error.message}. Showing fallback demo.`);
    }
}

function getMockBubbleSort(reason) {
    return {
        message: "# ⚠️ System Message\n" + reason + "\n\n# 💡 Intuition\nBubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order. Imagine a bubble rising to the surface; in each pass, the largest unsorted element 'bubbles' to its correct position.",
        code: "public class Demo {\n    public static void sort(int[] arr) {\n        // Basic Bubble Sort logic\n    }\n}",
        visualization: {
            title: "Fallback Demo",
            type: "array",
            timeComplexity: "O(N^2)",
            spaceComplexity: "O(1)",
            description: "A robust example to demonstrate the logic clearly.",
            steps: [
                { state: [8, 3, 11, 4, 1, 9, 2, 7], activeIndices: [], description: "Initial setup." },
                { state: [3, 8, 11, 4, 1, 9, 2, 7], activeIndices: [0, 1], description: "Comparing 8 and 3." }
            ]
        }
    };
}

module.exports = { processDSAQuery };
