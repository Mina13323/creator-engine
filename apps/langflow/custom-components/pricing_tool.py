from langflow.custom import CustomComponent
from langflow.schema import Record

class PricingTool(CustomComponent):
    display_name = "Dynamic Pricing Advisor"
    description = "Calculates optimal subscription plans and transaction commissions based on startup budget and target market segment buying power."

    def build_config(self):
        return {
            "budget": {
                "display_name": "Startup Budget",
                "type": "int",
                "info": "Initial funding amount in USD"
            }
        }

    def build(self, budget: int) -> Record:
        if budget < 1000:
            tier_strategy = "Low-barrier Freemium: Focus on transaction cut-rates (2-3%) rather than high monthly retainers. Introduce 1 basic premium tier of $5-$9/mo."
        else:
            tier_strategy = "Three-Tier Pricing: Standard free tier, $19/mo professional tier, $79/mo agency tier. Offer annual discounts to secure early working capital."

        return Record(text=tier_strategy)
