import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkApiRateLimit, getRequestIp } from "@/lib/api-rate-limit";
import type { SearchResult, SearchResponse } from "@/types";

const MAX_QUERY_LENGTH = 80;

export async function GET(request: NextRequest) {
  const q =
    request.nextUrl.searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) || "";

  if (!q || q.length < 2) {
    return NextResponse.json<SearchResponse>({
      results: [],
      recommendations: [],
      query: q,
    });
  }

  if (!checkApiRateLimit(`search:${getRequestIp(request)}`, 30, 60_000)) {
    return NextResponse.json<SearchResponse>(
      { results: [], recommendations: [], query: q },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  // Primary search
  const { data: results, error } = await supabase.rpc("search_site", {
    query: q,
    result_limit: 20,
  });

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json<SearchResponse>({
      results: [],
      recommendations: [],
      query: q,
    });
  }

  const searchResults: SearchResult[] = (results || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({
      result_type: r.result_type,
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      slug: r.slug,
      image_url: r.image_url,
      url: r.url,
      rank: r.rank,
    })
  );

  // If no results, fetch recommendations
  let recommendations: SearchResult[] = [];
  if (searchResults.length === 0) {
    const { data: recs } = await supabase.rpc("search_recommendations", {
      query: q,
      result_limit: 8,
    });

    recommendations = (recs || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => ({
        result_type: r.result_type,
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        slug: r.slug,
        image_url: r.image_url,
        url: r.url,
        rank: r.similarity_score,
      })
    );
  }

  return NextResponse.json<SearchResponse>({
    results: searchResults,
    recommendations,
    query: q,
  });
}
