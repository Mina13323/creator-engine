# n8n Financial Engine Workflow Specification

To integrate the Next.js API with n8n, you need to create a new workflow in your n8n instance using the following structure.

## Workflow Architecture (Nodes)

1. **Webhook Node (Trigger)**
   - **Method**: POST
   - **Path**: `financial-engine`
   - **Respond**: `Using 'Respond to Webhook' Node`
   - *This receives `businessIdea` and `businessModel` from Next.js.*

2. **MongoDB Atlas Vector Search Node**
   - **Action**: Query (Semantic Search)
   - **Collection**: `knowledge_vectors`
   - **Query**: `{{ $json.body.businessIdea }} + " " + {{ $json.body.businessModel }} + " Egyptian market pricing costs"`
   - *This retrieves the RAG context.*

3. **Gemini Chat Model Node (AI Agent)**
   - **Model**: `gemini-1.5-flash` or `gemini-1.5-pro`
   - **System Message**: *(See Prompt A below)*
   - **User Message**: `Business Idea: {{ $json.body.businessIdea }}\nModel: {{ $json.body.businessModel }}\nRAG Data: {{ $node["MongoDB Vector Search"].json.documents }}`

4. **Code Node (Financial Deterministic Math)**
   - **Language**: JavaScript
   - *This takes the Gemini output (which contains base estimates) and mathematically scales it out to 12 months (See Code B below).*

5. **Respond to Webhook Node**
   - **Respond With**: `JSON`
   - **JSON Data**: `{{ $json }}`
   - *Returns the final object to Next.js.*

---

## Prompt A: Gemini System Prompt

```text
You are an expert Financial Forecaster and Pricing Strategy Agent specializing in the Egyptian startup market.
Your job is to analyze the RAG data provided and the user's business idea, and extract realistic BASE COSTS and a PRICING STRATEGY.

DO NOT do 12-month projections. Only provide the base variables. Output MUST be valid JSON:

{
  "startupCosts": [
    { "category": "Legal & Formation (EGP)", "amount": 5000, "description": "Local commercial registry" }
  ],
  "monthlyFixedCosts": [
    { "category": "Hosting", "amount": 1500, "description": "AWS/Vercel base" }
  ],
  "initialMonthlyRevenue": 5000,
  "pricing": {
    "recommendedStrategyType": "Tiered Subscription",
    "priceTiers": [
      { "tierName": "Starter", "amount": 499, "billingCycle": "monthly", "targetSegment": "Solo founders", "features": ["Feature A"] }
    ],
    "marketPositioningRationale": "A short rationale based on Egyptian purchasing power."
  },
  "assumptionsApplied": ["List of assumptions"]
}
```

---

## Code B: Deterministic Financial Forecasting (Code Node)

Copy this into the n8n **Code** node. It takes the Gemini output and builds the strict 12-month forecast.

```javascript
// 1. Get the parsed JSON from Gemini
let baseData;
try {
  // Assuming Gemini outputs pure JSON or Markdown wrapped JSON
  const rawText = $input.first().json.text || $input.first().json.content;
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  baseData = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
} catch (e) {
  throw new Error("Failed to parse Gemini output into JSON: " + e.message);
}

// 2. Deterministic Math Configuration
const M_O_M_GROWTH_RATE = 1.15; // 15% month-over-month growth

let totalStartupCost = 0;
baseData.startupCosts.forEach(item => totalStartupCost += item.amount);

let monthlyBurn = 0;
baseData.monthlyFixedCosts.forEach(item => monthlyBurn += item.amount);

// 3. Generate 12 Month Projections
const revenueProjections = [];
let cumulativeRevenue = 0;
let breakEvenMonth = null;
let currentRevenue = baseData.initialMonthlyRevenue || 2000;

for (let m = 1; m <= 12; m++) {
  cumulativeRevenue += currentRevenue;
  
  // Break even logic: When cumulative revenue > (total startup cost + (monthly burn * month))
  if (!breakEvenMonth && cumulativeRevenue >= (totalStartupCost + (monthlyBurn * m))) {
    breakEvenMonth = m;
  }

  revenueProjections.push({
    month: m,
    projected_revenue: Math.round(currentRevenue),
    cumulative_revenue: Math.round(cumulativeRevenue)
  });

  // Apply growth
  currentRevenue = currentRevenue * M_O_M_GROWTH_RATE;
}

// 4. Construct Final API Output Payload
const finalOutput = {
  financial: {
    totalStartupCost: Math.round(totalStartupCost),
    monthlyBurn: Math.round(monthlyBurn),
    startupCosts: baseData.startupCosts,
    monthlyCosts: baseData.monthlyFixedCosts,
    revenueProjections: revenueProjections,
    breakEvenMonth: breakEvenMonth || "12+",
    assumptionsApplied: baseData.assumptionsApplied || []
  },
  pricing: baseData.pricing
};

return { json: finalOutput };
```
