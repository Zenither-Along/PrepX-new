import { NextRequest, NextResponse } from "next/server";
import { getPublicPaths } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");
    const query = searchParams.get("q") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const result = await getPublicPaths(query, tag, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch paths" },
      { status: 500 }
    );
  }
}
