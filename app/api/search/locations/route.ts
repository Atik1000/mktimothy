import { NextRequest, NextResponse } from "next/server";

// Minimal proxy for OpenStreetMap Nominatim search
// Usage policy: https://operations.osmfoundation.org/policies/nominatim/
// - Identify with User-Agent/Referer
// - Reasonable rate (client already debounced)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();

    // Basic validation and avoid unnecessary upstream calls
    if (!query || query.length < 3) {
      return NextResponse.json({ success: true, results: [] });
    }

    const host = req.headers.get("host") || "localhost";

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
      query
    )}&limit=8`;

    const res = await fetch(nominatimUrl, {
      headers: {
        Accept: "application/json",
        // Please customize this to your app/site. Nominatim requires proper identification.
        "User-Agent": "whatsapp-app/1.0 (+http://" + host + ")",
        Referer: "http://" + host,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: `Upstream error: ${res.status} ${text}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as any[];

    const results = (data || []).map((item) => ({
      id: String(item.place_id),
      name:
        (item.display_name || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)[0] ||
        item.name ||
        "",
      address: item.display_name || item.name || "",
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
