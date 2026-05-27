import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";

/**
 * GET /api/pexels?q=...&page=...
 *
 * Proxies searches to the Pexels API.
 * Requires PEXELS_API_KEY in environment (free at https://www.pexels.com/api/).
 *
 * Response shape matches the Unsplash proxy so the ImagePickerModal can share logic:
 *   { ok, photos: PexelsPhoto[], total, totalPages, page }
 */

type PexelsPhoto = {
  id:          string;
  url:         string;   // full-size (large2x)
  thumb:       string;   // thumbnail (small)
  small:       string;   // medium-size preview
  description: string;
  credit:      string;   // photographer name
  creditUrl:   string;   // photographer profile URL
};

const PER_PAGE = 20;

export async function GET(req: NextRequest) {
  // Any valid tenant/admin token — no per-tenant scoping needed for stock photos
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const q    = req.nextUrl.searchParams.get("q")    ?? "medical healthcare doctor";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok:    false,
      error: "PEXELS_API_KEY not configured",
      hint:  "Add PEXELS_API_KEY=your_key to .env.local. Get a free key at https://www.pexels.com/api/",
    });
  }

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query",       q);
    url.searchParams.set("page",        String(page));
    url.searchParams.set("per_page",    String(PER_PAGE));
    url.searchParams.set("orientation", "landscape");

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      // Cache for 5 minutes — same query returns the same results
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `Pexels API ${res.status}: ${text}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    const total      = (data.total_results as number) ?? 0;
    const totalPages = Math.ceil(total / PER_PAGE);

    const photos: PexelsPhoto[] = (data.photos ?? []).map((p: any) => ({
      id:          String(p.id),
      // Prefer large2x for full-resolution display; fall back gracefully
      url:         p.src?.large2x ?? p.src?.large    ?? p.src?.original ?? "",
      thumb:       p.src?.small   ?? p.src?.tiny     ?? "",
      small:       p.src?.medium  ?? p.src?.large    ?? "",
      description: (p.alt ?? "").trim(),
      credit:      p.photographer     ?? "Pexels",
      creditUrl:   p.photographer_url ?? "https://www.pexels.com",
    }));

    return NextResponse.json({ ok: true, photos, total, totalPages, page });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
