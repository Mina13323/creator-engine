from langflow.custom import CustomComponent
from langflow.schema import Record

class CompetitorTool(CustomComponent):
    display_name = "Competitor Matrix Evaluator"
    description = "Searches for standard incumbents in a specified industry sector and maps their primary strengths and weaknesses."

    def build_config(self):
        return {
            "sector": {
                "display_name": "Industry Sector",
                "type": "str",
                "info": "e.g., E-commerce, EdTech, Logistics"
            }
        }

    def build(self, sector: str) -> Record:
        sec = sector.lower()
        if "logistics" in sec:
            text = "Incumbents: Rabbit Mart, Upuse, Bosta. Strengths: Fleet density, established client accounts. Weaknesses: Heavy fossil fuel reliance, high commission rates."
        elif "edtech" in sec:
            text = "Incumbents: Abwaab, Noon Academy. Strengths: Massive curriculum coverage, venture capital backup. Weaknesses: Generic curriculum, lack of interactive local tutoring models."
        else:
            text = "Incumbents: Global SaaS providers. Strengths: Feature maturity. Weaknesses: Lack of local language support, high USD pricing limits customer lifetime value in regional markets."

        return Record(text=text)
