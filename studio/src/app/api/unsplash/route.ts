import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/token";

export async function GET(req: NextRequest) {
  // Any valid tenant or admin token — no tenantId scoping needed
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const q       = req.nextUrl.searchParams.get("q") ?? "medical healthcare doctor";
  const page    = req.nextUrl.searchParams.get("page") ?? "1";
  const perPage = "20";

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({
      ok: false,
      error: "UNSPLASH_ACCESS_KEY not configured",
      hint: "Add UNSPLASH_ACCESS_KEY=your_key to .env.local. Get a free key at https://unsplash.com/developers",
    });
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, error: `Unsplash API error ${res.status}: ${text}` }, { status: res.status });
    }

    const data = await res.json();
    const photos = (data.results ?? []).map((p: any) => ({
      id:          p.id          as string,
      url:         (p.urls?.regular ?? "") + "&w=1200&q=80",
      thumb:       (p.urls?.thumb   ?? "") + "&w=400&q=80",
      small:       (p.urls?.small   ?? "") + "&w=640&q=80",
      description: p.description ?? p.alt_description ?? "",
      credit:      p.user?.name  ?? "Unsplash",
      creditUrl:   (p.user?.links?.html ?? "https://unsplash.com") + "?utm_source=doctor_sites&utm_medium=referral",
      downloadUrl: p.links?.download_location ?? "",
      width:       p.width  as number,
      height:      p.height as number,
    }));

    return NextResponse.json({
      ok:         true,
      photos,
      total:      data.total       as number,
      totalPages: data.total_pages as number,
      page:       Number(page),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
