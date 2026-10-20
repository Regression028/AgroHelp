// app/api/recommend/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import Groq from "groq-sdk";

export const runtime = "nodejs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------- Types ----------
interface CropItem {
  name: string;
  bestHybrid: string;
  irrigation: string;
  waterRequirement: string;
  yield: string;
  profit: string;
  reason: string;
}

interface HybridDetail {
  name: string;
  description: string;
  farming_method: string;
  duration: string;
  water_needs: string;
  fertilizer_needs: string;
  pest_resistance: string;
  market_price: string;
  market_demand: string;
  selling_platforms: string[];
  government_schemes: string[];
  profit_margin: string;
  breakeven_time: string;
}

const EMPTY_RECOMMENDATION = {
  fieldCrops: [] as CropItem[],
  vegetables: [] as CropItem[],
  fruitTrees: [] as CropItem[],
  floweringPlants: [] as CropItem[],
};

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error(
      "JSON parse failed. Raw preview:",
      raw.slice(0, 300)
    );
    return fallback;
  }
}


// ---------- Weather helper (non-fatal) ----------

async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is missing from .env.local");
  }

  try {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: "metric",
        },
        timeout: 10000,
      }
    );

    return {
      temperature: res.data.main.temp as number,
      humidity: res.data.main.humidity as number,
      location: res.data.name as string,
    };
  } catch (err: any) {
    console.error(
      "Weather API error:",
      err?.response?.status,
      err?.response?.data?.message || err.message
    );

    throw new Error(
      `Weather fetch failed: ${
        err?.response?.data?.message || err.message
      }`
    );
  }
}


// ---------- Main POST handler ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lat,
      lon,
      cropName,
      generateHybrids,
      hybridName,
      getHybridDetails,
    } = body;

    // Branch 1: specific hybrid details
    if (getHybridDetails && cropName && hybridName) {
      return await getSpecificHybridDetails(cropName, hybridName, lat, lon);
    }

    // Branch 2: generate hybrids for a crop
    if (generateHybrids && cropName) {
      return await generateHybridDetails(cropName, lat, lon);
    }

    // Branch 3: main recommendation
    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: "Latitude and Longitude are required" },
        { status: 400 }
      );
    }

    const weather = await getWeather(lat, lon);

    // Ask Groq for STRICT JSON
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a highly experienced agricultural scientist. You ALWAYS respond with valid JSON only. No markdown, no commentary, no code fences.",
        },
        {
          role: "user",
          content: `Location: ${weather.location}
Temperature: ${weather.temperature}°C
Humidity: ${weather.humidity}%

Return ONLY a valid JSON object with EXACTLY this schema:

{
  "fieldCrops": [
    {
      "name": "Crop name",
      "bestHybrid": "Hybrid/variety name",
      "irrigation": "Irrigation method",
      "waterRequirement": "Low | Medium | High",
      "yield": "X quintals/hectare",
      "profit": "₹X per hectare",
      "reason": "Why suitable for this climate"
    }
  ],
  "vegetables": [ ...same shape... ],
  "fruitTrees": [ ...same shape... ],
  "floweringPlants": [ ...same shape... ]
}

Rules:
- EXACTLY 10 items in EACH of the 4 arrays.
- All fields MUST be non-empty strings.
- Do NOT wrap in markdown. Do NOT add explanation text.
- Output raw JSON only.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const parsed = safeJsonParse(raw, EMPTY_RECOMMENDATION);

    // Ensure all 4 keys exist as arrays
    const recommendation = {
      fieldCrops: Array.isArray(parsed.fieldCrops) ? parsed.fieldCrops : [],
      vegetables: Array.isArray(parsed.vegetables) ? parsed.vegetables : [],
      fruitTrees: Array.isArray(parsed.fruitTrees) ? parsed.fruitTrees : [],
      floweringPlants: Array.isArray(parsed.floweringPlants)
        ? parsed.floweringPlants
        : [],
    };

    return NextResponse.json({
      success: true,
      location: weather.location,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
      },
      recommendation,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error?.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong",
        details: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

// ---------- Hybrid generation ----------
async function generateHybridDetails(
  cropName: string,
  lat?: number,
  lon?: number
) {
  try {
    let locationContext = "";
    if (lat && lon) {
      const w = await getWeather(lat, lon);
      locationContext = `\nLocation Weather:\nTemperature: ${w.temperature}°C\nHumidity: ${w.humidity}%\nLocation: ${w.location}`;
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert agricultural consultant specializing in hybrid crop varieties. 
You MUST provide EXACTLY 5 different hybrid varieties for the requested crop.
Each hybrid should have unique characteristics and benefits.
Focus on Indian agricultural context with practical advice.`,
        },
        {
          role: "user",
          content: `
Crop Name: ${cropName}${locationContext}

Provide detailed information about EXACTLY 5 DIFFERENT hybrid varieties for this crop.

For EACH hybrid, provide the following in a structured format:

1. **Hybrid Name**: [Name]
   * Description: [1-2 sentences]
   * Farming Method: [2-3 sentences]
   * Growing Duration: [Days]
   * Water Requirements: [Details]
   * Fertilizer Requirements: [NPK ratios]
   * Pest Resistance: [Which pests]
   * Market Price: [INR]
   * Market Demand: [High/Medium/Low]
   * Selling Platforms: [3-4 platforms]
   * Government Schemes: [2-3 schemes]
   * Profit Margin: [INR per acre]
   * Breakeven Time: [Timeline]
`,
        },
      ],
      temperature: 0.8,
      max_tokens: 6000,
    });

    const hybridsText = completion.choices?.[0]?.message?.content || "";
    let hybrids = parseHybrids(hybridsText, cropName);

    while (hybrids.length < 4) {
      hybrids.push(generateFallbackHybrid(cropName, hybrids.length + 1));
    }
    if (hybrids.length > 5) hybrids = hybrids.slice(0, 5);

    return NextResponse.json({
      success: true,
      cropName,
      hybrids,
      count: hybrids.length,
    });
  } catch (error: any) {
    console.error("❌ Hybrid Generation Error:", error);
    const fallbackHybrids = generateFallbackHybrids(cropName, 4);
    return NextResponse.json({
      success: true,
      cropName,
      hybrids: fallbackHybrids,
      count: fallbackHybrids.length,
      fallback: true,
    });
  }
}

// ---------- Specific hybrid details ----------
async function getSpecificHybridDetails(
  cropName: string,
  hybridName: string,
  lat?: number,
  lon?: number
) {
  try {
    let locationContext = "";
    if (lat && lon) {
      const w = await getWeather(lat, lon);
      locationContext = `\nLocation Weather:\nTemperature: ${w.temperature}°C\nHumidity: ${w.humidity}%\nLocation: ${w.location}`;
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert agricultural consultant. Provide EXTREMELY DETAILED information about a specific hybrid variety.`,
        },
        {
          role: "user",
          content: `
Crop: ${cropName}
Hybrid Variety: ${hybridName}${locationContext}

Provide COMPLETE detailed information:

1. **Complete Description**
2. **Farming Method** (step-by-step)
3. **Growing Duration**
4. **Water Requirements**
5. **Fertilizer Requirements**
6. **Pest Resistance**
7. **Market Price**
8. **Market Demand**
9. **Selling Platforms**
10. **Government Schemes**
11. **Profit Margin**
12. **Breakeven Time**
13. **Harvesting Method**
14. **Post-Harvest Management**
15. **Common Problems**
`,
        },
      ],
      temperature: 0.5,
      max_tokens: 8000,
    });

    const detailsText = completion.choices?.[0]?.message?.content || "";
    const details = parseDetailedHybrid(detailsText, hybridName);

    return NextResponse.json({
      success: true,
      cropName,
      hybridName,
      details,
    });
  } catch (error: any) {
    console.error("❌ Hybrid Details Error:", error);
    return NextResponse.json({
      success: true,
      cropName,
      hybridName,
      details: generateFallbackDetailedHybrid(cropName, hybridName),
      fallback: true,
    });
  }
}

// ---------- Parsers & fallbacks (unchanged from original) ----------
function parseHybrids(text: string, cropName: string): HybridDetail[] {
  const hybrids: HybridDetail[] = [];
  const hybridRegex =
    /\d+\.\s+\*\*([^*]+)\*\*([\s\S]*?)(?=\n\s*\d+\.\s+\*\*|$)/g;
  let match;
  while ((match = hybridRegex.exec(text)) !== null) {
    const hybridName = match[1].trim();
    const block = match[2];
    if (hybridName.length < 3) continue;
    hybrids.push({
      name: hybridName,
      description:
        extractField(block, "Description") ||
        `${hybridName} - High yielding hybrid for ${cropName}`,
      farming_method:
        extractField(block, "Farming Method") ||
        "Sow in well-prepared field with proper spacing.",
      duration:
        extractField(block, "Growing Duration") ||
        extractField(block, "Duration") ||
        "120-135 days",
      water_needs:
        extractField(block, "Water Requirements") ||
        "Medium (5-6 irrigations)",
      fertilizer_needs:
        extractField(block, "Fertilizer Requirements") || "120:60:40 NPK kg/ha",
      pest_resistance:
        extractField(block, "Pest Resistance") ||
        "Moderately resistant to common pests",
      market_price:
        extractField(block, "Market Price") || "₹2000-2200/quintal",
      market_demand: extractField(block, "Market Demand") || "High",
      selling_platforms: extractList(block, "Selling Platforms", 3),
      government_schemes: extractList(block, "Government Schemes", 2),
      profit_margin:
        extractField(block, "Profit Margin") || "₹35,000-40,000/acre",
      breakeven_time: extractField(block, "Breakeven Time") || "5-6 months",
    });
  }
  return hybrids;
}

function parseDetailedHybrid(text: string, hybridName: string): any {
  return {
    name: hybridName,
    description:
      extractField(text, "Complete Description") ||
      extractField(text, "Description") ||
      "",
    farming_method: extractField(text, "Farming Method") || "",
    duration: extractField(text, "Growing Duration") || "",
    water_needs: extractField(text, "Water Requirements") || "",
    fertilizer_needs: extractField(text, "Fertilizer Requirements") || "",
    pest_resistance: extractField(text, "Pest Resistance") || "",
    market_price: extractField(text, "Market Price") || "",
    market_demand: extractField(text, "Market Demand") || "",
    selling_platforms: extractList(text, "Selling Platforms", 5),
    government_schemes: extractList(text, "Government Schemes", 4),
    profit_margin: extractField(text, "Profit Margin") || "",
    breakeven_time: extractField(text, "Breakeven Time") || "",
    harvest_method: extractField(text, "Harvesting Method") || "",
    storage_requirements: extractField(text, "Post-Harvest Management") || "",
    common_problems: extractList(text, "Common Problems", 3),
  };
}

function extractField(text: string, fieldName: string): string | null {
  const regex = new RegExp(
    `${fieldName}:?\\s*([^\\n]+(?:\\n[^\\n*]+)*)`,
    "i"
  );
  const match = text.match(regex);
  if (match) return match[1].trim().replace(/\n/g, " ");
  return null;
}

function extractList(
  text: string,
  fieldName: string,
  minItems: number = 2
): string[] {
  const regex = new RegExp(
    `${fieldName}:?\\s*([^\\n]+(?:\\n\\s*[-•][^\\n]+)*)`,
    "i"
  );
  const match = text.match(regex);
  if (!match) return generateDefaultList(fieldName, minItems);
  const content = match[1];
  let items: string[] = [];
  if (content.includes("\n")) {
    items = content
      .split("\n")
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((item) => item.length > 0 && item.length < 100);
  }
  if (items.length === 0 && content.includes(",")) {
    items = content.split(",").map((i) => i.trim()).filter(Boolean);
  }
  if (items.length === 0 && content.length > 0) items = [content.trim()];
  while (items.length < minItems) {
    items.push(generateDefaultListItem(fieldName, items.length + 1));
  }
  return items.slice(0, minItems + 2);
}

function generateFallbackHybrid(
  cropName: string,
  index: number
): HybridDetail {
  const names = [
    "Premier",
    "Elite",
    "Advanced",
    "Supreme",
    "Ultimate",
  ];
  const name = `${cropName} ${names[index % names.length]} ${String.fromCharCode(64 + index)}`;
  return {
    name,
    description: `High-yielding ${cropName} hybrid with excellent disease resistance.`,
    farming_method: `Sow in well-prepared field. Use certified seeds at 20-25 kg/ha.`,
    duration: `${120 + index * 5}-${135 + index * 5} days`,
    water_needs: index % 2 === 0 ? "Medium (5-6 irrigations)" : "High (7-8 irrigations)",
    fertilizer_needs: `${110 + index * 10}:${50 + index * 5}:${40 + index * 5} NPK kg/ha`,
    pest_resistance: `Resistant to common pests`,
    market_price: `₹${2000 + index * 150}-${2200 + index * 150}/quintal`,
    market_demand: index % 2 === 0 ? "High" : "Medium",
    selling_platforms: [
      "APMC Mandi",
      "Local Traders",
      "Online Platforms",
      "FPOs",
    ],
    government_schemes: ["PM-KISAN", "RKVY", "Soil Health Card"],
    profit_margin: `₹${35000 + index * 3000}-${40000 + index * 3000}/acre`,
    breakeven_time: `${5 + (index % 3)}-${6 + (index % 3)} months`,
  };
}

function generateFallbackHybrids(
  cropName: string,
  count: number
): HybridDetail[] {
  return Array.from({ length: count }, (_, i) =>
    generateFallbackHybrid(cropName, i + 1)
  );
}

function generateFallbackDetailedHybrid(cropName: string, hybridName: string) {
  return {
    name: hybridName,
    description: `${hybridName} is a premium ${cropName} hybrid.`,
    farming_method: "Land prep → Sowing → Irrigation → Fertilizer → Pest control.",
    duration: "125-135 days",
    water_needs: "5-6 irrigations (Medium)",
    fertilizer_needs: "120:60:40 NPK kg/ha",
    pest_resistance: "Resistant to leaf rust",
    market_price: "₹2,100-2,300/quintal",
    market_demand: "High",
    selling_platforms: ["APMC Mandi", "Private Traders", "Online", "Cooperatives"],
    government_schemes: ["PM-KISAN", "RKVY", "PMFBY"],
    profit_margin: "₹38,000-42,000/acre",
    breakeven_time: "5 months",
    harvest_method: "Harvest at maturity, dry to <20% moisture.",
    storage_requirements: "Store at 12% moisture in dry godown.",
    common_problems: ["Rust", "Aphids", "Termites"],
  };
}

function generateDefaultList(fieldName: string, count: number): string[] {
  const lists: Record<string, string[]> = {
    "Selling Platforms": [
      "APMC Mandi",
      "Local Traders",
      "Online Platforms",
      "FPOs",
    ],
    "Government Schemes": ["PM-KISAN", "RKVY", "Soil Health Card", "PMFBY"],
    "Common Problems": ["Pest attack", "Disease", "Weather damage"],
  };
  return lists[fieldName]?.slice(0, count) || Array(count).fill("N/A");
}

function generateDefaultListItem(_fieldName: string, index: number): string {
  const d = ["APMC Mandi", "Local Trader", "Online Platform", "Cooperative"];
  return d[index % d.length];
}