import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const CAR_ANALYSIS_PROMPT = `
Analyze this car image and extract all technical specifications and details.
Return the result in a strict JSON format that matches the following schema:

{
  "title": "A descriptive title (e.g., 2023 Toyota Camry LE)",
  "price": number (infer if there is a window sticker or price tag, otherwise set to 0),
  "transmission": "Automatic" | "Manual" | "CVT",
  "bodyType": "Sedan" | "SUV" | "Truck" | "Coupe" | "Hatchback" | "Van",
  "description": "A detailed 2-3 sentence description of the car based on its visual condition and visible features.",
  "specs": {
    "make": "The brand (e.g., Toyota)",
    "model": "The specific model (e.g., Camry)",
    "year": number (the manufacturing or model year),
    "fuelType": "Petrol" | "Diesel" | "Electric" | "Hybrid",
    "mileage": "Estimated mileage string if visible (e.g. 10,000 km), else empty string",
    "color": "The primary exterior color"
  },
  "features": ["Feature 1", "Feature 2", "List any visible features like Sunroof, Alloy Wheels, Leather Seats, etc."],
  "tags": ["Category 1", "Category 2", "Tags like Luxury, Compact, Family, Sporty, etc."]
}

IMPORTANT:
1. If you cannot determine a mandatory field, use a sensible default or leave as an empty string.
2. The "transmission" and "bodyType" MUST precisely match one of the allowed enum values.
3. Return ONLY the JSON object.
`;
