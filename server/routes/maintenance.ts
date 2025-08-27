import { Router } from "express";

export const maintenanceRouter = Router();

// Helper: trivial VIN sanitation
const sv = (s:string)=> (s||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,17);

maintenanceRouter.get("/api/v1/maintenance/predict", async (req, res) => {
  try {
    const vin = sv(String(req.query.vin||""));
    const mileage = Number(req.query.mileage || 0) || undefined;
    if (vin.length !== 17) return res.status(400).json({ error: "Invalid VIN" });

    // Fetch decode (vPIC) to build context — you already have this proxy elsewhere
    const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const decoded = await r.json();

    // If no key, return deterministic fallback so UI always shows content
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        vin,
        source: "fallback",
        items: [
          { title: "Oil & Filter", when: "Next 5k mi", reason: "Standard interval; adjust for severe use." },
          { title: "Brake Inspection", when: "Next 10k mi", reason: "Age/mileage based; track pad/rotor wear." },
          { title: "Tire Rotation", when: "Next 5k–7k mi", reason: "Even wear; check alignment if cupping." }
        ],
        notes: "Set OPENAI_API_KEY to enable model‑driven personalization."
      });
    }

    // Lazy import to avoid startup crash if key missing
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = "You are an automotive service advisor. Return compact, practical maintenance suggestions as JSON.";
    const user = {
      vin,
      mileage: mileage ?? null,
      decoded: decoded?.Results ?? null
    };

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: JSON.stringify(user) +
          "\nReturn JSON: {items:[{title,when,reason}], notes?}. Keep it brand-appropriate." }
      ],
      response_format: { type: "json_object" },
    });

    let data: any = {};
    try { data = JSON.parse(resp.choices[0]?.message?.content || "{}"); } catch {}

    // Never return empty; provide guard rails
    if (!data?.items?.length) {
      data = { items: [{ title: "General Inspection", when: "Next 5k mi", reason: "Baseline guidance." }], notes: "AI returned empty; using default." };
    }

    return res.json({ vin, source: "ai", ...data });
  } catch (e: any) {
    const msg = String(e?.message || e);
    // Surface a clean error so the UI can show a banner
    return res.status(500).json({ error: msg.slice(0, 300) });
  }
});