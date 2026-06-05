/**
 * Competitor Matrix Evaluator Tool
 * Ported from competitor_tool.py
 */
function build(sector) {
    const sec = (sector || '').toLowerCase();
    let text = "";
    
    if (sec.includes("logistics")) {
        text = "Incumbents: Rabbit Mart, Upuse, Bosta. Strengths: Fleet density, established client accounts. Weaknesses: Heavy fossil fuel reliance, high commission rates.";
    } else if (sec.includes("edtech")) {
        text = "Incumbents: Abwaab, Noon Academy. Strengths: Massive curriculum coverage, venture capital backup. Weaknesses: Generic curriculum, lack of interactive local tutoring models.";
    } else {
        text = "Incumbents: Global SaaS providers. Strengths: Feature maturity. Weaknesses: Lack of local language support, high USD pricing limits customer lifetime value in regional markets.";
    }

    return { text };
}

module.exports = { build };
