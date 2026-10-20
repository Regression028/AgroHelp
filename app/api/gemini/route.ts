
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A valid prompt is required." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return NextResponse.json({
      text: response.text || "__NO_RESPONSE__",
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      { error: "Failed to get a response from Gemini." },
      { status: 500 }
    );
  }
}
