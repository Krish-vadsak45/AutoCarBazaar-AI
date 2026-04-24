import { NextResponse } from 'next/server';

import { geminiModel } from '@/lib/ai';
import { CarListItem } from '@/src/types';

type CompareInputCar = CarListItem & {
  title: string;
  price: number | string;
  features?: string[];
};

export async function POST(req: Request) {
  try {
    const { cars } = (await req.json()) as { cars: CompareInputCar[] };

    if (!cars || cars.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 cars to generate a comparison conclusion.' },
        { status: 400 }
      );
    }

    const carsDetails = cars
      .map(
        (car: CompareInputCar, idx: number) =>
          `Car ${idx + 1}: ${car.title}
          Price: $${car.price}
          Year: ${car.specs?.year || 'N/A'}
          Make: ${car.specs?.make || 'N/A'}
          Model: ${car.specs?.model || 'N/A'}
          Mileage: ${car.specs?.mileage || 'N/A'}
          Transmission: ${car.transmission || 'N/A'}
          Fuel Type: ${car.specs?.fuelType || 'N/A'}
          Body Type: ${car.bodyType || 'N/A'}
          Features: ${(car.features || []).join(', ') || 'N/A'}`
      )
      .join('\n\n');

    const prompt = `As an expert automotive advisor, provide a clear, concise, and professional conclusion comparing the following cars:

${carsDetails}

Your goal is to help a potential buyer decide. Focus on the best value for money, strengths, and primary trade-offs of each option. Do not list raw specs. Keep the response to 1 or 2 short paragraphs totaling under 150 words. Do not use Markdown formatting like bolding or bullet points, just plain text.`;

    let result;
    try {
      result = await geminiModel.generateContent(prompt);
    } catch (apiError: unknown) {
      console.error('AI Generate Content Error:', apiError);

      const isHighDemand =
        apiError instanceof Error
          ? apiError.message.includes('503')
          : !!(apiError && typeof apiError === 'object' && 'status' in apiError && apiError.status === 503);

      return NextResponse.json(
        {
          conclusion: isHighDemand
            ? 'The AI comparison feature is currently experiencing high demand. Please check back in a few minutes for your intelligent verdict.'
            : 'An error occurred while generating the AI comparison. Please try again later.',
        },
        { status: 200 } // Send 200 so the UI displays the fallback message gracefully instead of throwing a generic error
      );
    }

    // The model might be set with responseMimeType: "application/json" globally in lib/ai.ts
    // If it is, the output might be json. Let's force text generation if needed, or handle string.
    let responseText = result.response.text();

    // Attempt parse if it came out as JSON string.
    try {
      const parsed = JSON.parse(responseText);
      if (typeof parsed === 'object') {
        responseText = Object.values(parsed).join(' ');
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    } // Not JSON, fine.

    return NextResponse.json({ conclusion: responseText.trim() });
  } catch (error) {
    console.error('AI Compare Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI conclusion.' }, { status: 500 });
  }
}
