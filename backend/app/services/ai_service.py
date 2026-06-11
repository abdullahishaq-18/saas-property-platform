from google import genai
from app.core.config import settings

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def score_lead(source: str, status: str) -> str:
    prompt = f"""
Lead Source: {source}
Lead Status: {status}

Classify this lead as:
HOT
WARM
COLD

Return only one word.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    result = response.text.strip().upper()

    if result not in ["HOT", "WARM", "COLD"]:
        return "WARM"

    return result


def generate_followup_email(
    lead_name: str,
    lead_source: str,
    lead_score: str
) -> str:

    prompt = f"""
Write a professional commercial real estate follow-up email.

Lead Name: {lead_name}
Lead Source: {lead_source}
Lead Score: {lead_score}

Return only the email.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text

def generate_property_description(
    title: str,
    location: str,
    price: float,
    size: int
) -> str:

    prompt = f"""
Create a professional commercial real estate listing description.

DO NOT use markdown.
DO NOT use bullet points.
DO NOT use ** symbols.
Return plain text only.

Property:
Title: {title}
Location: {location}
Price: {price}
Size: {size} sq ft
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text