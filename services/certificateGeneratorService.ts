import cloudinary from "../lib/cloudinary";
import puppeteer from "puppeteer";
import { prepareCertificateData } from "../lib/certificate-service";
import { getCertificateTemplateHtml } from "../lib/certificate-image-generator";

export async function uploadCertificateImageToCloudinary(
  imageBuffer: Buffer,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            public_id: `certificates/${publicId}`,
            overwrite: true,
            format: "png",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(imageBuffer);
    });
    return {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error("Error uploading certificate image to Cloudinary:", error);
    throw error;
  }
}

/**
 * Generates a certificate image buffer from HTML using Puppeteer.
 */
export async function generateCertificateImageBuffer(
  html: string
): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const element = await page.$("body");
  if (!element) {
    await browser.close();
    throw new Error("Failed to find body element for screenshot");
  }
  const screenshotBuffer = await element.screenshot({ type: "png" });
  await browser.close();
  return Buffer.from(screenshotBuffer);
}

/**
 * Generates and uploads a certificate image for a user and course.
 * Returns the secure_url and public_id from Cloudinary.
 */
export async function generateAndUploadCertificateImage(
  userId: string,
  courseId: string
): Promise<{ secure_url: string; public_id: string }> {
  const certificateData = await prepareCertificateData(userId, courseId);
  if (!certificateData) {
    throw new Error("Invalid user or course data for certificate");
  }
  const templateHtml = getCertificateTemplateHtml(
    certificateData.fullName,
    certificateData.courseTitle
  );
  const imageBuffer = await generateCertificateImageBuffer(templateHtml);
  const uploadResult = await uploadCertificateImageToCloudinary(
    imageBuffer,
    certificateData.certificateCode
  );
  return uploadResult;
}
