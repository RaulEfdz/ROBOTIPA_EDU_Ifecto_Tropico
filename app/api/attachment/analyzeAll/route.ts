import { NextRequest, NextResponse } from "next/server";

const UPLOADTHING_API_KEY = process.env.UPLOADTHING_SECRET;
const API_URL = "https://api.uploadthing.com/v6/listFiles";

export async function POST(req: NextRequest) {
  if (!UPLOADTHING_API_KEY) {
    return NextResponse.json({ error: "API Key faltante" }, { status: 500 });
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": UPLOADTHING_API_KEY,
      },
      body: JSON.stringify({ limit: 10000, offset: 0 }),
    });

    const data = await res.json();
    const files = data.files || [];

    let totalSize = 0;
    let smallest: { size: number; } | null = null;
    const nameCount: Record<string, number> = {};

    files.forEach((file: any) => {
      if (!file?.size) return;
      totalSize += file.size;
      if (!smallest || file.size < smallest.size) smallest = file;
      nameCount[file.name] = (nameCount[file.name] || 0) + 1;
    });

    const duplicates = Object.fromEntries(
      Object.entries(nameCount).filter(([, count]) => count > 1)
    );

    return NextResponse.json({
      fileCount: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: parseFloat((totalSize / 1024 / 1024).toFixed(2)),
      smallestFile: smallest,
      duplicateNames: duplicates,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
