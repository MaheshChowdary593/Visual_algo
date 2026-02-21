const Mistral = require('@mistralai/mistralai');

let mistralInstance = null;

function getMistralClient() {
    if (mistralInstance) return mistralInstance;

    const key = process.env.MISTRAL_API_KEY;
    if (key && key !== 'your_api_key_here' && key.length > 10) {
        console.log(`[Mistral SDK] Initializing with key ending in ...${key.slice(-4)}`);
        // Handle both possible export patterns for the SDK
        const ClientClass = Mistral.default || Mistral;
        mistralInstance = new ClientClass(key);
        return mistralInstance;
    }
    console.warn('[Mistral SDK] No valid API key found or placeholder "your_api_key_here" detected.');
    return null;
}

/**
 * Stage 2: Validator Layer
 * Ensures the JSON structure is correct and follows the expected schema.
 */
function validateVisualizationData(data) {
    if (!data || typeof data !== 'object') throw new Error("[v2.1] Output is not a valid object");
    if (!data.visualization) throw new Error("Missing 'visualization' field in root object");

    const viz = data.visualization;
    const requiredFields = ['title', 'type', 'steps'];
    for (const field of requiredFields) {
        if (!viz[field]) throw new Error(`Visualization is missing required field: '${field}'`);
    }

    if (!Array.isArray(viz.steps)) {
        throw new Error("Visualization 'steps' field must be an array");
    }

    if (viz.steps.length === 0) {
        throw new Error("Visualization must have at least one step");
    }

    // Type-specific validation for steps
    viz.steps.forEach((step, idx) => {
        if (viz.type === 'tree') {
            if (!Array.isArray(step.nodes)) throw new Error(`[v2.1] Step ${idx} is missing 'nodes' for tree`);
            step.nodes.forEach((n, ni) => {
                if (n.id === undefined || n.val === undefined) throw new Error(`Step ${idx} node ${ni} is missing id or val`);
                // Binary trees expect left/right pointers (IDs)
                if (n.left === undefined && n.right === undefined && n.children === undefined) {
                    console.warn(`Step ${idx} node ${ni} has no structure (left/right/children)`);
                }
            });
        } else if (viz.type === 'array' || viz.type === 'stack' || viz.type === 'queue') {
            if (!Array.isArray(step.state)) throw new Error(`Step ${idx} is missing 'state' (array) for ${viz.type}`);
        } else if (viz.type === 'linked-list') {
            if (!Array.isArray(step.nodes)) throw new Error(`Step ${idx} is missing 'nodes' for linked-list`);
            step.nodes.forEach((n, ni) => {
                if (n.id === undefined || n.val === undefined) throw new Error(`Step ${idx} node ${ni} is missing id or val`);
            });
        } else if (viz.type === 'graph') {
            if (!Array.isArray(step.nodes)) throw new Error(`Step ${idx} is missing 'nodes' for graph`);
            if (!Array.isArray(step.edges)) throw new Error(`Step ${idx} is missing 'edges' for graph`);
        } else if (viz.type === 'recursion') {
            if (!Array.isArray(step.stack)) throw new Error(`Step ${idx} is missing 'stack' for recursion`);
        } else if (viz.type === 'hashmap') {
            if (!Array.isArray(step.entries)) throw new Error(`Step ${idx} is missing 'entries' for hashmap`);
        }
    });

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

    // Try normal parse
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("[llmService] Simple JSON.parse failed, trying extraction logic...");

        // 1. Try to extract from markdown code blocks
        const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        let target = mdMatch ? mdMatch[1] : text;

        // 2. Try to find anything between the first { and last }
        const jsonMatch = target.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let jsonStr = jsonMatch[0];

            try {
                return JSON.parse(jsonStr);
            } catch (innerError) {
                // 3. Last ditch: some basic regex cleaning for common LLM JSON mistakes
                // Strip trailing commas before closing braces/brackets
                jsonStr = jsonStr.replace(/,\s*([\}\]])/g, '$1');

                try {
                    return JSON.parse(jsonStr);
                } catch (lastError) {
                    console.error("[llmService] Final JSON parse attempt failed:", lastError.message);
                }
            }
        }
        throw new Error("Invalid JSON format in AI response. Extraction failed.");
    }
}

/**
 * Stage 1: LLM Generation
 * Generates a step-by-step DSA visualization data and code using Mistral AI.
 */
/**
 * Stage 1: LLM Generation
 * Generates a step-by-step DSA visualization data and code using Mistral AI.
 */
async function processDSAQuery(query, history = []) {
    const mistral = getMistralClient();
    if (!mistral) {
        return getMockBubbleSort("Mistral API Key is missing or invalid. Please update the MISTRAL_API_KEY in server/.env with a real key from https://console.mistral.ai/");
    }

    let responseContent = null;

    const systemPrompt = `
You are a Data Structures and Algorithms (DSA) visualization expert. 
Your task is to provide a comprehensive explanation and a structured dataset for rendering a step-by-step visualization.

CRITICAL: RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN OUTSIDE THE JSON.

SCHEMA REQUIREMENTS:
{
  "message": "Markdown explanation with headings: # 💡 Intuition, # 🏗️ Example, # 📊 Dry Run Output",
  "code": "A complete Java code implementation.",
  "visualization": {
    "title": "Clear Title",
    "description": "Short summary.",
    "type": "array" | "tree" | "linked-list" | "stack" | "queue" | "recursion" | "graph" | "hashmap",
    "timeComplexity": "O(...)",
    "spaceComplexity": "O(...)",
    "steps": [
      {
        "description": "Step detail",
        "state": [...], // Required for array, stack, queue
        "nodes": [...], // Required for tree, graph, linked-list
        "edges": [...], // Required for graph
        "stack": [...], // Required for recursion
        "entries": [...], // Required for hashmap
        "activeIndices": [0, 1], // Optional for array
        "activeNodeId": "node1"   // Optional for tree, graph, linked-list
      }
    ]
  }
}

DATA GUIDELINES (STRICT ADHERENCE):
- 'array': 'state' is an array of primitives [1, 2, 3].
- 'tree': 'nodes' must be an array of { id: "1", val: 10, left: "2", right: "3" }. Use IDs for pointers.
- 'linked-list': 'nodes' must be an array of { id: "1", val: 10, next: true/false }.
- 'graph': 'nodes' must have { id, val, x, y } (coords 0-500), 'edges' must have { from, to }.
- 'recursion': 'stack' must be an array of { fn: "name", args: {n:5}, val: null }.
- 'hashmap': 'entries' must be an array of { key: "k", val: "v", hash: index }.
- Ensure 'steps' explicitly capture the progression of the algorithm.
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
        console.log("=========================================");
        console.log("🚀 [v2.1] PROCESSING QUERY:", query);
        console.log("History length:", history.length);
        console.log("=========================================");

        // Try both possible SDK method names
        const chatMethod = (mistral.chat && mistral.chat.complete) ?
            mistral.chat.complete.bind(mistral.chat) :
            (mistral.chat ? mistral.chat.bind(mistral) : null);

        if (!chatMethod) {
            throw new Error("Mistral SDK method 'chat.complete' or 'chat' not found. Check SDK version.");
        }

        const response = await chatMethod({
            model: "mistral-large-latest",
            messages,
            responseFormat: { type: "json_object" },
            temperature: 0.2
        });

        responseContent = response.choices?.[0]?.message?.content;
        const parsed = extractJSON(responseContent);

        // Stage 2: Validation
        console.log(`[Mistral AI] Validating response schema...`);
        const validatedData = validateVisualizationData(parsed);

        console.log(`[Mistral AI] Success - Response validated`);
        return validatedData;

    } catch (error) {
        console.error(`[Mistral AI] Pipeline Error:`, error && error.message ? error.message : error);

        // Safe logging to avoid circular reference errors in JSON.stringify
        const fs = require('fs');
        const errorDetail = error && error.response && error.response.data ?
            JSON.stringify(error.response.data) :
            (error && error.message ? error.message : "Unknown Error");

        const errorLog = `\n--- ERROR [${new Date().toISOString()}] ---\n` +
            `Query: ${query}\n` +
            `Error: ${errorDetail}\n` +
            `Stack: ${error && error.stack ? error.stack : 'N/A'}\n` +
            `------------------\n`;

        try {
            // Only try to write to file if in dev or if we have permissions
            if (process.env.NODE_ENV !== 'production') {
                fs.appendFileSync('server_error.log', errorLog);
            }
            console.error(errorLog);
        } catch (e) {
            console.error('Failed to log error to console/file:', e.message);
        }

        return getMockBubbleSort(`Mistral AI Error [v2.1]: ${error && error.message ? error.message : String(error)}. Showing fallback demo.`);
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
