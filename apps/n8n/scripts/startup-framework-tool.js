/**
 * Startup Framework Strategist Tool
 * Ported from startup_framework_tool.py
 */
function build(framework) {
    const fw = (framework || '').toLowerCase();
    let advice = "";
    
    if (fw.includes("lean")) {
        advice = (
            "Lean Canvas Advice: Focus on the Problem-Solution link first. " +
            "List your top 3 customer problems and map them directly to single MVP features. " +
            "Identify your unfair advantage—what cannot be easily copied or bought by competitors."
        );
    } else {
        advice = "Design Thinking Advice: Empathize with users, define problem statements, ideate solutions, prototype MVPs, test rapidly.";
    }

    return { text: advice };
}

module.exports = { build };
