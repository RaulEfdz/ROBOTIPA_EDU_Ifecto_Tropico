import { NextResponse } from "next/server";
import { fetchImagesFromFolder } from "./fetchImagesFromFolder";

export async function POST(req: Request) {
  try {
    const { folder } = await req.json();

    if (!folder || typeof folder !== 'string') {
      return NextResponse.json(
        { message: 'Invalid or missing folder name in request body' },
        { status: 400 }
      );
    }

    const images = await fetchImagesFromFolder(folder);
    const listImgs = images.map(img=> img?.url)

    return NextResponse.json(images);

  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json(
      { message: 'Failed to fetch images from Cloudinary' },
      { status: 500 }
    );
  }
}
