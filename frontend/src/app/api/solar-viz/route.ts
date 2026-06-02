import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const { imageUrl } = (await req.json()) as { imageUrl: string };

    // Only allow Google Maps Street View Static API URLs
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (parsedUrl.hostname !== "maps.googleapis.com" || !parsedUrl.pathname.startsWith("/maps/api/streetview")) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }

    // Fetch the Street View Static image server-side
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Street view fetch failed: ${imgRes.status}` }, { status: 502 });
    }
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(imgBuffer).toString("base64");
    const mimeType = (imgRes.headers.get("content-type") ?? "image/jpeg").split(";")[0];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64 } },
            {
              text: "Edit this street-level photo: cover every visible rooftop surface with dark navy photovoltaic solar panels arranged in neat rows and columns, flush with the roof slope. The panels should look photorealistic and fill the entire visible roof area. Do not modify anything else — sky, walls, windows, trees, road, or parked cars must remain exactly as in the original photo. Return only the modified image.",
            },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType ?? "image/png",
        });
      }
    }

    return NextResponse.json({ error: "Gemini returned no image" }, { status: 500 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[solar-viz]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
