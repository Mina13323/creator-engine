from langflow.custom import CustomComponent
from langflow.schema import Record

class EgyptMarketTool(CustomComponent):
    display_name = "Egypt Market Data Assistant"
    description = "Provides localized insights on Egyptian demographics, transaction channels, and mobile wallet adoption rates."
    
    def build_config(self):
        return {
            "query": {
                "display_name": "Search Query",
                "type": "str",
                "info": "Specific sector to look up (e.g. Fintech, Logistics, Edtech)"
            }
        }

    def build(self, query: str) -> Record:
        query_lower = query.lower()
        insights = ""
        
        if "fintech" in query_lower or "pay" in query_lower:
            insights = (
                "Egypt fintech indicators: Mobile cash transactions grew by 80% year-on-year. "
                "InstaPay (operated by Central Bank of Egypt) has reached over 6 million users. "
                "Credit card penetration remains under 10%, making COD and instant wallet payments (Vodafone Cash, Fawry) absolute requirements."
            )
        elif "logistics" in query_lower or "delivery" in query_lower:
            insights = (
                "Egypt logistics indicators: Fuel subsidy cuts are driving interest in electric micro-mobility tricycles. "
                "Cairo and Giza house over 20 million residents, making hyper-dense neighborhood clusters "
                "more profitable for last-mile delivery operations than regional distribution networks."
            )
        else:
            insights = (
                "Egypt general market indicators: Population exceeds 110 million. "
                "Median age is 24.8 years, signaling high tech adoption. "
                "Internet penetration stands at 72.2%. User price sensitivity is high; micro-transactions "
                "denominated in EGP are preferred over USD-denominated subscription plans."
            )

        return Record(
            text=insights,
            data={
                "market": "Egypt",
                "target_demographics": "Tech-savvy youth & cash-first buyers",
                "payment_gateways": ["Paymob", "Fawry", "InstaPay", "Vodafone Cash"]
            }
        )
