import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const DEFAULT_APP_NAME = 'UnknownApp'; // Added a default for the formatted app name
const appNameFormatted = (process.env.NAME_APP?.toUpperCase().replace(/ /g, '') || DEFAULT_APP_NAME).replace(/ /g, '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, folder: requestFolder } = body;

    const DEFAULT_FOLDER = 'UnknownApp';
    const formattedFolder = requestFolder?.toUpperCase().replace(/ /g, '') || '';

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const publicId = uuidv4();

    const uploadOptions: UploadApiOptions = {
      folder: `${appNameFormatted}/${formattedFolder}` || DEFAULT_FOLDER,
      resource_type: 'auto',
      public_id: publicId,
    };

    const result = await cloudinary.uploader.upload(image, uploadOptions);

    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}