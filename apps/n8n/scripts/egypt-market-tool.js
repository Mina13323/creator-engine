/**
 * Egypt Market Data Assistant Tool
 * Ported from egypt_market_tool.py
 */
function build(query) {
    const query_lower = (query || '').toLowerCase();
    let insights = "";
    
    if (query_lower.includes("fintech") || query_lower.includes("pay")) {
        insights = (
            "Egypt fintech indicators: Mobile cash transactions grew by 80% year-on-year. " +
            "InstaPay (operated by Central Bank of Egypt) has reached over 6 million users. " +
            "Credit card penetration remains under 10%, making COD and instant wallet payments (Vodafone Cash, Fawry) absolute requirements."
        );
    } else if (query_lower.includes("logistics") || query_lower.includes("delivery")) {
        insights = (
            "Egypt logistics indicators: Fuel subsidy cuts are driving interest in electric micro-mobility tricycles. " +
            "Cairo and Giza house over 20 million residents, making hyper-dense neighborhood clusters " +
            "more profitable for last-mile delivery operations than regional distribution networks."
        );
    } else {
        insights = (
            "Egypt general market indicators: Population exceeds 110 million. " +
            "Median age is 24.8 years, signaling high tech adoption. " +
            "Internet penetration stands at 72.2%. User price sensitivity is high; micro-transactions " +
            "denominated in EGP are preferred over USD-denominated subscription plans."
        );
    }

    return {
        text: insights,
        data: {
            market: "Egypt",
            target_demographics: "Tech-savvy youth & cash-first buyers",
            payment_gateways: ["Paymob", "Fawry", "InstaPay", "Vodafone Cash"]
        }
    };
}

module.exports = { build };
