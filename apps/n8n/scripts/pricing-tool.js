/**
 * Dynamic Pricing Advisor Tool
 * Ported from pricing_tool.py
 */
function build(budget) {
    let tier_strategy = "";
    
    if (budget < 1000) {
        tier_strategy = "Low-barrier Freemium: Focus on transaction cut-rates (2-3%) rather than high monthly retainers. Introduce 1 basic premium tier of $5-$9/mo.";
    } else {
        tier_strategy = "Three-Tier Pricing: Standard free tier, $19/mo professional tier, $79/mo agency tier. Offer annual discounts to secure early working capital.";
    }

    return { text: tier_strategy };
}

module.exports = { build };
