from langflow.custom import CustomComponent # type: ignore
from langflow.schema import Record # type: ignore

class StartupFrameworkTool(CustomComponent):
    display_name = "Startup Framework Strategist"
    description = "Provides advice on structuring Lean Canvas, MVP scope, and product-market fit loops."

    def build_config(self):
        return {
            "framework": {
                "display_name": "Startup Framework",
                "type": "str",
                "info": "e.g., Lean Canvas, Design Thinking"
            }
        }

    def build(self, framework: str) -> Record:
        fw = framework.lower()
        if "lean" in fw:
            advice = (
                "Lean Canvas Advice: Focus on the Problem-Solution link first. "
                "List your top 3 customer problems and map them directly to single MVP features. "
                "Identify your unfair advantage—what cannot be easily copied or bought by competitors."
            )
        else:
            advice = "Design Thinking Advice: Empathize with users, define problem statements, ideate solutions, prototype MVPs, test rapidly."

        return Record(text=advice)
