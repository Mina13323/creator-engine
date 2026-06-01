import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local files paths
const FLOWS_DIR = path.resolve(process.cwd(), '../langflow/flows');
const CHATS_FILE = path.resolve(process.cwd(), 'chats_history.json');
const PREDICTIONS_FILE = path.resolve(process.cwd(), 'predictions_store.json');

// Helper to read JSON safely
function readJSONFile(filePath, defaultVal = {}) {
    try {
        if (!fs.existsSync(filePath)) {
            return defaultVal;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`[Local Agents] Error reading file ${filePath}:`, e);
        return defaultVal;
    }
}

// Helper to write JSON safely
function writeJSONFile(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error(`[Local Agents] Error writing file ${filePath}:`, e);
    }
}

// Fallback direct LLM call if Langflow is down
async function callLLMFallback(systemPrompt, userPrompt) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey && !geminiKey.includes('AIzaSy...')) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Prompt:\n${userPrompt}` }] }]
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (e) {
            console.warn('[Local Fallback] Gemini API call failed:', e);
        }
    }

    if (openaiKey && !openaiKey.includes('sk-proj-')) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });
            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
        } catch (e) {
            console.warn('[Local Fallback] OpenAI API call failed:', e);
        }
    }

    return null;
}

// Background agent execution via Langflow
async function runLangflowAgent(slug, message, conversationId, requestId) {
    const langflowUrl = process.env.LANGFLOW_API_URL || 'http://localhost:7860';
    const url = `${langflowUrl}/api/v1/run/${slug}`;
    const headers = { 'Content-Type': 'application/json' };
    
    if (process.env.LANGFLOW_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.LANGFLOW_TOKEN}`;
    }

    console.log(`[Langflow Agent Run] Triggering ${slug} | requestId: ${requestId} | url: ${url}`);
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                input_value: message,
                input_type: 'chat',
                output_type: 'chat',
                tweaks: {}
            })
        });

        if (!res.ok) {
            throw new Error(`Langflow returned status ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        console.log(`[Langflow Agent Run] Response received for ${slug}:`, JSON.stringify(data).slice(0, 300));

        // Attempt to parse results out of Langflow outputs structure
        const resultText = 
            data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
            data.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
            data.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
            data.outputs?.[0]?.outputs?.[0]?.results?.text ||
            data.result ||
            data.output ||
            (data.outputs?.[0]?.outputs?.[0]?.results?.message && typeof data.outputs[0].outputs[0].results.message === 'string' ? data.outputs[0].outputs[0].results.message : null) ||
            JSON.stringify(data);

        // Update persistent chats
        const chats = readJSONFile(CHATS_FILE, { conversations: {} });
        if (!chats.conversations[conversationId]) {
            chats.conversations[conversationId] = { agent_id: slug, history: [] };
        }
        const assistantMessage = {
            role: 'assistant',
            content: resultText,
            timestamp: new Date().toISOString()
        };
        chats.conversations[conversationId].history.push(assistantMessage);
        writeJSONFile(CHATS_FILE, chats);

        // Update prediction state
        const preds = readJSONFile(PREDICTIONS_FILE, { predictions: {} });
        preds.predictions[requestId] = {
            status: 'completed',
            is_complete: true,
            conversation_id: conversationId,
            messages: [
                {
                    role: 'assistant',
                    content: resultText,
                    timestamp: new Date().toISOString()
                }
            ]
        };
        writeJSONFile(PREDICTIONS_FILE, preds);

    } catch (err) {
        console.warn(`[Langflow Agent Run] Langflow connection failed. Invoking direct LLM fallback for ${slug}:`, err);
        
        try {
            // Find system prompt description from flow if possible
            let systemPrompt = "You are a helpful startup advisor co-founder assistant.";
            const flowPath = path.join(FLOWS_DIR, `${slug}.json`);
            if (fs.existsSync(flowPath)) {
                const flowData = readJSONFile(flowPath, null);
                if (flowData && flowData.description) {
                    systemPrompt += ` Your profile: ${flowData.description}`;
                }
            }

            const fallbackText = await callLLMFallback(systemPrompt, message);
            if (fallbackText) {
                // Update history
                const chats = readJSONFile(CHATS_FILE, { conversations: {} });
                if (!chats.conversations[conversationId]) {
                    chats.conversations[conversationId] = { agent_id: slug, history: [] };
                }
                const assistantMessage = {
                    role: 'assistant',
                    content: fallbackText,
                    timestamp: new Date().toISOString()
                };
                chats.conversations[conversationId].history.push(assistantMessage);
                writeJSONFile(CHATS_FILE, chats);

                // Update prediction state
                const preds = readJSONFile(PREDICTIONS_FILE, { predictions: {} });
                preds.predictions[requestId] = {
                    status: 'completed',
                    is_complete: true,
                    conversation_id: conversationId,
                    messages: [
                        {
                            role: 'assistant',
                            content: fallbackText,
                            timestamp: new Date().toISOString()
                        }
                    ]
                };
                writeJSONFile(PREDICTIONS_FILE, preds);
                return;
            }
        } catch (fallbackErr) {
            console.error('[Local Fallback] Fallback also failed:', fallbackErr);
        }

        // If fallback also fails, return the initial connection failure
        const preds = readJSONFile(PREDICTIONS_FILE, { predictions: {} });
        preds.predictions[requestId] = {
            status: 'failed',
            is_complete: true,
            error: `Failed to run agent flow: ${err.message}. Ensure your Langflow instance is running locally on port 7860.`
        };
        writeJSONFile(PREDICTIONS_FILE, preds);
    }
}

// List all agents mapped from langflow JSON files
function getLocalAgents() {
    try {
        if (!fs.existsSync(FLOWS_DIR)) {
            console.warn(`[Local Agents] Flows directory not found at ${FLOWS_DIR}`);
            return [];
        }
        const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json'));
        const agents = [];
        for (const file of files) {
            const filePath = path.join(FLOWS_DIR, file);
            const content = readJSONFile(filePath, null);
            if (content) {
                const slug = file.replace('.json', '');
                agents.push({
                    id: slug,
                    agent_id: slug,
                    name: content.name || slug,
                    description: content.description || '',
                    welcome_message: `Hello! I am ${content.name || slug}. I am connected directly to your local Langflow agent flow. How can I assist you today?`,
                    icon_url: null,
                    initial_suggestions: [
                        {
                            label: "Run Workflow Flow",
                            prompt: `Let's execute the ${content.name || slug} workflow.`
                        }
                    ],
                    theme: "cosmic",
                    is_owner: true,
                    owner_username: "local",
                    like_count: 0,
                    has_liked: false
                });
            }
        }
        return agents;
    } catch (e) {
        console.error('[Local Agents] Error listing agents:', e);
        return [];
    }
}

export async function GET(request, { params }) {
    const slug = await params;
    const pathSegments = slug.path || [];
    const pathStr = pathSegments.join('/');

    console.log(`[GET /api/agents] Path: ${pathStr}`);

    // Route: GET /api/agents/templates/agents, user/agents, featured/agents
    if (pathStr === 'templates/agents' || pathStr === 'user/agents' || pathStr === 'featured/agents' || pathStr === '') {
        const localAgents = getLocalAgents();
        return NextResponse.json(localAgents);
    }

    // Route: GET /api/agents/by-slug/[slug]
    if (pathSegments[0] === 'by-slug' && pathSegments.length === 2) {
        const agentSlug = pathSegments[1];
        const localAgents = getLocalAgents();
        const found = localAgents.find(a => a.id === agentSlug);
        if (found) {
            return NextResponse.json(found);
        }
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Route: GET /api/agents/by-slug/[slug]/[conversation_id]
    if (pathSegments[0] === 'by-slug' && pathSegments.length === 3) {
        const agentSlug = pathSegments[1];
        const conversationId = pathSegments[2];

        const chats = readJSONFile(CHATS_FILE, { conversations: {} });
        const conv = chats.conversations[conversationId] || { agent_id: agentSlug, history: [] };
        return NextResponse.json(conv);
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST(request, { params }) {
    const slug = await params;
    const pathSegments = slug.path || [];
    const pathStr = pathSegments.join('/');

    console.log(`[POST /api/agents] Path: ${pathStr}`);

    // Route: POST /api/agents/by-slug/[slug]/chat
    if (pathSegments[0] === 'by-slug' && pathSegments[2] === 'chat') {
        const agentSlug = pathSegments[1];
        
        try {
            const body = await request.json();
            const { message, conversation_id } = body;
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Save user message to history
            const chats = readJSONFile(CHATS_FILE, { conversations: {} });
            if (!chats.conversations[conversation_id]) {
                chats.conversations[conversation_id] = { agent_id: agentSlug, history: [] };
            }
            chats.conversations[conversation_id].history.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            writeJSONFile(CHATS_FILE, chats);

            // Initialize prediction state
            const preds = readJSONFile(PREDICTIONS_FILE, { predictions: {} });
            preds.predictions[requestId] = {
                status: 'processing',
                is_complete: false,
                conversation_id
            };
            writeJSONFile(PREDICTIONS_FILE, preds);

            // Execute the flow in the background
            runLangflowAgent(agentSlug, message, conversation_id, requestId);

            return NextResponse.json({ request_id: requestId, conversation_id });
        } catch (e) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    // Route: POST /api/agents/by-slug/[slug]/like
    if (pathSegments[0] === 'by-slug' && pathSegments[2] === 'like') {
        const { searchParams } = new URL(request.url);
        const isLike = searchParams.get('is_like') === 'true';
        return NextResponse.json({ has_liked: isLike, like_count: isLike ? 1 : 0 });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function PUT(request, { params }) {
    const slug = await params;
    const pathSegments = slug.path || [];
    
    // Route: PUT /api/agents/by-slug/[slug] (update theme)
    if (pathSegments[0] === 'by-slug' && pathSegments.length === 2) {
        try {
            const body = await request.json();
            return NextResponse.json({ success: true, theme: body.theme });
        } catch (e) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function DELETE(request, { params }) {
    return NextResponse.json({ success: true });
}
