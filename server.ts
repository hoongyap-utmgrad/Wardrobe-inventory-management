import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Helper for Gemini Client
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Outfit Suggestions
  app.post("/api/ai/suggest-outfits", async (req, res) => {
    try {
      const { items, weather, vibe } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No clothing items provided" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        const fallbackSuggestions = generateFallbackOutfits(items, weather, vibe);
        return res.json({ suggestions: fallbackSuggestions, source: "rule-engine" });
      }

      // Filter available items
      const availableItems = items
        .filter((i: any) => i.status === "AVAILABLE" || !i.status)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          color: item.color,
          formality: item.formality,
          timesWorn: item.timesWorn || 0,
          season: item.season || [],
        }));

      if (availableItems.length === 0) {
        return res.json({
          suggestions: [],
          message: "All items are currently marked as worn or in laundry! Wash some clothes to get suggestions.",
        });
      }

      const prompt = `
You are an expert personal fashion stylist and smart wardrobe manager AI.
Analyze the user's available clothing items and recommend 3 distinct, stylish outfit combinations specifically tailored for today's weather and vibe.

Weather Info:
- Location: ${weather?.locationName || 'Current City'}
- Temperature: ${weather?.temperature ?? 22}°C
- Condition: ${weather?.condition || 'Sunny'}
- Summary: ${weather?.summary || 'Mild & Pleasant'}

Vibe / Occasion: ${vibe || 'Casual Everyday'}

User's Available Closet Items:
${JSON.stringify(availableItems, null, 2)}

Instructions:
1. Form complete outfits using the item IDs provided (e.g. Tops + Bottoms + Footwear, optional Outerwear or Accessories; OR One-Piece + Footwear).
2. ONLY use item IDs that exist in the input list.
3. Factor in weather: prioritize warmer/layered items for cold/rainy days, light breathable items for warm days.
4. Favor items with lower 'timesWorn' when sensible, so the user rotates their wardrobe evenly.
5. Provide a clear, encouraging 2-sentence stylist note explaining why the outfit works and how to style it.

Return a JSON array of outfit objects.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchScore: { type: Type.NUMBER },
                weatherSuitability: { type: Type.STRING },
                aiAdvice: { type: Type.STRING },
                vibe: { type: Type.STRING },
              },
              required: ["title", "itemIds", "matchScore", "weatherSuitability", "aiAdvice", "vibe"],
            },
          },
        },
      });

      const rawText = response.text || "[]";
      let suggestions = [];
      try {
        suggestions = JSON.parse(rawText);
      } catch (e) {
        console.error("Error parsing Gemini JSON response:", e);
        suggestions = generateFallbackOutfits(items, weather, vibe);
      }

      return res.json({ suggestions, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Gemini Outfit Suggestion Error:", err);
      const fallbackSuggestions = generateFallbackOutfits(req.body.items || [], req.body.weather, req.body.vibe);
      return res.json({ suggestions: fallbackSuggestions, source: "rule-engine-fallback" });
    }
  });

  // AI Check Outfit Weather Suitability
  app.post("/api/ai/check-weather-suitability", async (req, res) => {
    try {
      const { items, weather, outfitName } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0 || !weather) {
        return res.status(400).json({ error: "Missing items or weather info" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          advice: `For ${weather.temperature}°C ${weather.condition}, ensure you have adequate layers and comfortable fabrics suited to current temperatures.`,
          source: "offline-rule",
        });
      }

      const prompt = `
You are a smart fashion weather advisor.
Analyze whether this outfit (${outfitName || 'Current Logged Outfit'}) is appropriate for the following weather change:

Weather Conditions:
- Location: ${weather.locationName}
- Temperature: ${weather.temperature}°C
- Condition: ${weather.condition}
- Summary: ${weather.summary || ''}
- Humidity: ${weather.humidity || 50}%
- Wind: ${weather.windSpeed || 10} km/h

Outfit Pieces:
${items.map((i: any) => `- ${i.name} (${i.category}, ${i.color}, seasons: ${(i.season || []).join(', ')})`).join('\n')}

Provide a concise JSON response:
- isAppropriate (boolean): true if safe & comfortable, false if inappropriate (e.g. no coat in freezing weather, heavy jacket in 30°C heat, sandals in snow)
- severity: "optimal" | "mild_warning" | "severe_warning"
- score: number 0-100
- headline: short 1-line summary warning or praise
- reasons: array of strings explaining any issues (empty if optimal)
- recommendations: array of quick practical clothing swaps or layer additions
- stylistAdvice: 2 short sentences of actionable advice
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAppropriate: { type: Type.BOOLEAN },
              severity: { type: Type.STRING },
              score: { type: Type.NUMBER },
              headline: { type: Type.STRING },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              stylistAdvice: { type: Type.STRING },
            },
            required: ["isAppropriate", "severity", "score", "headline", "reasons", "recommendations", "stylistAdvice"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Weather suitability AI check error:", err);
      return res.status(500).json({ error: "Failed to evaluate weather suitability" });
    }
  });

  // AI Auto-Tag clothing from camera/image
  app.post("/api/ai/analyze-clothing", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          analysis: {
            name: "Clothing Item",
            category: "Tops",
            color: "Neutral",
            formality: "Casual",
            season: ["Spring", "Summer"],
            notes: "Auto-tagged clothing item",
          },
        });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: `Examine this photo of a clothing item or fashion accessory. Return a JSON object with:
              - name: concise descriptive item name (e.g., "Oversized Charcoal Hoodie", "Dark Wash Slim Jeans", "White Leather Sneakers", "Floral Summer Dress")
              - category: MUST be one of ["Tops", "Bottoms", "Outerwear", "One-Piece", "Footwear", "Accessories"]
              - color: main color name (e.g. "Charcoal Grey", "Navy", "Emerald Green", "White")
              - formality: MUST be one of ["Casual", "Smart Casual", "Formal", "Sporty"]
              - season: Array containing subset of ["Spring", "Summer", "Autumn", "Winter"]
              - notes: 1 brief sentence describing pattern, fabric, or style details.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              color: { type: Type.STRING },
              formality: { type: Type.STRING },
              season: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
            },
            required: ["name", "category", "color", "formality", "season", "notes"],
          },
        },
      });

      const analysis = JSON.parse(response.text || "{}");
      return res.json({ analysis });
    } catch (err: any) {
      console.error("Gemini Clothing Tag Error:", err);
      return res.json({
        analysis: {
          name: "Recorded Garment",
          category: "Tops",
          color: "Custom",
          formality: "Casual",
          season: ["All Season"],
          notes: "Item recorded in inventory",
        },
      });
    }
  });

  // Fallback rule engine
  function generateFallbackOutfits(items: any[], weather: any, vibe: any) {
    const available = items.filter((i) => i.status === "AVAILABLE" || !i.status);

    const tops = available.filter((i) => i.category === "Tops");
    const bottoms = available.filter((i) => i.category === "Bottoms");
    const outerwear = available.filter((i) => i.category === "Outerwear");
    const footwear = available.filter((i) => i.category === "Footwear");
    const dresses = available.filter((i) => i.category === "One-Piece");
    const accessories = available.filter((i) => i.category === "Accessories");

    const results: any[] = [];
    const temp = weather?.temperature ?? 22;

    if (tops.length > 0 && bottoms.length > 0) {
      const top = tops[0];
      const bottom = bottoms[0];
      const shoe = footwear[0];
      const jacket = temp < 18 && outerwear.length > 0 ? outerwear[0] : null;

      const ids = [top.id, bottom.id];
      if (shoe) ids.push(shoe.id);
      if (jacket) ids.push(jacket.id);

      results.push({
        title: `${top.color || ''} ${top.name} & ${bottom.name}`.trim(),
        itemIds: ids,
        matchScore: 94,
        weatherSuitability: temp < 18 ? "Warm & Layered" : "Light & Breathable",
        aiAdvice: `A reliable classic pairing suited for ${weather?.condition || 'today\'s weather'}.`,
        vibe: vibe || "Casual Everyday",
      });
    }

    if (dresses.length > 0 && footwear.length > 0) {
      const dress = dresses[0];
      const shoe = footwear[1] || footwear[0];
      results.push({
        title: `${dress.name} Ensemble`,
        itemIds: [dress.id, shoe.id],
        matchScore: 92,
        weatherSuitability: "Chic & Effortless",
        aiAdvice: `Single piece styling paired with ${shoe.name}. Quick and stylish for any plan.`,
        vibe: "Smart Casual",
      });
    } else if (tops.length > 1 && bottoms.length > 0) {
      const top = tops[1];
      const bottom = bottoms[bottoms.length - 1];
      const shoe = footwear[footwear.length - 1] || footwear[0];
      const ids = [top.id, bottom.id];
      if (shoe) ids.push(shoe.id);

      results.push({
        title: `Fresh Combo: ${top.name}`,
        itemIds: ids,
        matchScore: 89,
        weatherSuitability: "Versatile Daily Look",
        aiAdvice: `Brings out your less frequently worn ${top.name} to keep your daily rotation balanced.`,
        vibe: vibe || "Daily Wear",
      });
    }

    if (outerwear.length > 0 && tops.length > 0 && bottoms.length > 0) {
      const top = tops[tops.length - 1];
      const bottom = bottoms[0];
      const jacket = outerwear[0];
      const shoe = footwear[0];
      const acc = accessories[0];

      const ids = [top.id, bottom.id, jacket.id];
      if (shoe) ids.push(shoe.id);
      if (acc) ids.push(acc.id);

      results.push({
        title: `Layered ${jacket.name} Streetwear`,
        itemIds: ids,
        matchScore: 96,
        weatherSuitability: temp < 20 ? "Perfect protection against breeze" : "Stylish structured layer",
        aiAdvice: `Layering ${jacket.name} over ${top.name} creates depth and easily adjusts to temperature shifts throughout the day.`,
        vibe: "Elevated Streetwear",
      });
    }

    return results;
  }

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Digital Closet Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
