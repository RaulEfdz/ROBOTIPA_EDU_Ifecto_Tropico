import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export type ImageResource = {
  url: string;
  public_id: string;
};

export const fetchImagesFromFolder = async (folderName: string): Promise<ImageResource[]> => {
  try {
    const resources: ImageResource[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderName, // Nombre de la carpeta
        max_results: 100, // Límite por petición
        next_cursor: nextCursor, // Paginación
      });

      const folderResources = response.resources.map((resource: any) => ({
        url: resource.secure_url,
        public_id: resource.public_id,
      }));

      resources.push(...folderResources);
      nextCursor = response.next_cursor;
    } while (nextCursor); // Continúa mientras haya más imágenes

    return resources;
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    throw new Error('Error fetching images from Cloudinary');
  }
};
