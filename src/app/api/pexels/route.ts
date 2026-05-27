import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireGemAuth } from "@/lib/token";

type PexelsPhoto = {
  id:          string;
  url:         string;
  thumb:       string;
  small:       string;
  description: string;
  credit:      string;
  creditUrl:   string;
};

export async function GET(req: NextRequest) {
  let auth = requireAuth(req);
  if (!auth.ok) auth = requireGemAuth(req, "");
  if (!auth.ok) return auth.response;

  const q       = req.nextUrl.searchParams.get("q")       ?? "medical healthcare doctor";
  const page    = Number(req.nextUrl.searchParams.get("page")    ?? "1");
  const perPage = Number(req.nextUrl.searchParams.get("per_page") ?? req.nextUrl.searchParams.get("perPage") ?? "20");

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok:    false,
      error: "PEXELS_API_KEY not configured",
      details: [{ path: "", message: "Add PEXELS_API_KEY to environment" }],
    });
  }

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query",       q);
    url.searchParams.set("page",        String(page));
    url.searchParams.set("per_page",    String(perPage));
    url.searchParams.set("orientation", "landscape");

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `Pexels API ${res.status}`, details: [{ path: "", message: text }] },
        { status: res.status },
      );
    }

    const data = await res.json();
    const total      = (data.total_results as number) ?? 0;
    const totalPages = Math.ceil(total / perPage);

    const photos: PexelsPhoto[] = (data.photos ?? []).map((p: any) => ({
      id:          String(p.id),
      url:         p.src?.large2x ?? p.src?.large    ?? p.src?.original ?? "",
      thumb:       p.src?.small   ?? p.src?.tiny     ?? "",
      small:       p.src?.medium  ?? p.src?.large    ?? "",
      description: (p.alt ?? "").trim(),
      credit:      p.photographer     ?? "Pexels",
      creditUrl:   p.photographer_url ?? "https://www.pexels.com",
    }));

    return NextResponse.json({ ok: true, photos, total, totalPages, page });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), details: [{ path: "", message: String(err) }] }, { status: 500 });
  }
}
