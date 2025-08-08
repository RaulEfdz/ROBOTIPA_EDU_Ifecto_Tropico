import { Dropbox } from 'dropbox';

// Configuración de Dropbox
const dropboxConfig = {
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  clientId: process.env.DROPBOX_APP_KEY,
  clientSecret: process.env.DROPBOX_APP_SECRET,
};

// Instancia de Dropbox
let dbx: Dropbox | null = null;

const getDropboxInstance = (): Dropbox | null => {
  if (!dropboxConfig.accessToken) {
    console.warn('Dropbox access token not configured');
    return null;
  }

  if (!dbx) {
    dbx = new Dropbox(dropboxConfig);
  }
  
  return dbx;
};

/**
 * Convierte una URL de compartición de Dropbox en una URL directa de descarga
 * @param shareUrl - URL de compartición de Dropbox
 * @returns URL directa para descargar/mostrar el archivo
 */
export const getDirectDropboxUrl = (shareUrl: string): string => {
  try {
    // Convertir la URL de compartición a URL directa
    // Cambiar 'dl=0' a 'dl=1' para descarga directa
    const directUrl = shareUrl.replace('dl=0', 'dl=1');
    return directUrl;
  } catch (error) {
    console.error('Error converting Dropbox URL:', error);
    return shareUrl; // Retornar URL original en caso de error
  }
};

/**
 * Obtiene los metadatos de un archivo desde Dropbox
 * @param filePath - Ruta del archivo en Dropbox
 * @returns Promise con los metadatos del archivo
 */
export const getFileMetadata = async (filePath: string) => {
  const dropbox = getDropboxInstance();
  
  if (!dropbox) {
    throw new Error('Dropbox not configured');
  }

  try {
    const response = await dropbox.filesGetMetadata({ path: filePath });
    return response;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

/**
 * Lista archivos en una carpeta de Dropbox
 * @param folderPath - Ruta de la carpeta (vacío para raíz)
 * @returns Promise con la lista de archivos
 */
export const listFiles = async (folderPath: string = '') => {
  const dropbox = getDropboxInstance();
  
  if (!dropbox) {
    throw new Error('Dropbox not configured');
  }

  try {
    const response = await dropbox.filesListFolder({ path: folderPath });
    return response.result.entries;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Obtiene una URL temporal de descarga para un archivo
 * @param filePath - Ruta del archivo en Dropbox
 * @returns Promise con la URL temporal
 */
export const getTemporaryLink = async (filePath: string) => {
  const dropbox = getDropboxInstance();
  
  if (!dropbox) {
    throw new Error('Dropbox not configured');
  }

  try {
    const response = await dropbox.filesGetTemporaryLink({ path: filePath });
    return response.result.link;
  } catch (error) {
    console.error('Error getting temporary link:', error);
    throw error;
  }
};

/**
 * Extrae el ID del archivo desde una URL de Dropbox
 * @param dropboxUrl - URL de Dropbox
 * @returns ID del archivo o null si no se puede extraer
 */
export const extractFileId = (dropboxUrl: string): string | null => {
  try {
    const url = new URL(dropboxUrl);
    const pathSegments = url.pathname.split('/');
    const fileIdIndex = pathSegments.findIndex(segment => segment === 'fi') + 1;
    
    if (fileIdIndex > 0 && fileIdIndex < pathSegments.length) {
      return pathSegments[fileIdIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file ID:', error);
    return null;
  }
};

/**
 * Obtiene URLs de logos directamente desde la carpeta de Dropbox
 */
export const getLogoUrls = async () => {
  const dropbox = getDropboxInstance();
  
  if (!dropbox) {
    // Fallback a variables de entorno si no hay conexión a Dropbox
    const logoUrl = process.env.NEXT_PUBLIC_LOGO;
    const logoLightUrl = process.env.NEXT_PUBLIC_LOGO_LIGHT;
    const faviconUrl = process.env.NEXT_PUBLIC_LOGO_FAVICON;

    return {
      logo: logoUrl ? getDirectDropboxUrl(logoUrl) : '/LOGO.png',
      logoLight: logoLightUrl ? getDirectDropboxUrl(logoLightUrl) : '/LOGO_LIGHT.png',
      favicon: faviconUrl ? getDirectDropboxUrl(faviconUrl) : '/FAVICON.png',
    };
  }

  try {
    // Obtener archivos de la carpeta /ROBOTIPA_EDU
    const files = await listFiles('/ROBOTIPA_EDU');
    
    const logoFile = files.find(file => file.name === 'LOGO.png');
    const logoLightFile = files.find(file => file.name === 'LOGO_LIGHT.png');
    const faviconFile = files.find(file => file.name === 'FAVICON.png');

    const results = {
      logo: '/LOGO.png',
      logoLight: '/LOGO_LIGHT.png',
      favicon: '/FAVICON.png',
    };

    // Obtener enlaces temporales para cada archivo encontrado
    if (logoFile && logoFile.path_lower) {
      try {
        const logoLink = await getTemporaryLink(logoFile.path_lower);
        results.logo = logoLink;
      } catch (error) {
        console.warn('Error getting logo link:', error);
      }
    }

    if (logoLightFile && logoLightFile.path_lower) {
      try {
        const logoLightLink = await getTemporaryLink(logoLightFile.path_lower);
        results.logoLight = logoLightLink;
      } catch (error) {
        console.warn('Error getting logo light link:', error);
      }
    }

    if (faviconFile && faviconFile.path_lower) {
      try {
        const faviconLink = await getTemporaryLink(faviconFile.path_lower);
        results.favicon = faviconLink;
      } catch (error) {
        console.warn('Error getting favicon link:', error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching logos from Dropbox:', error);
    
    // Fallback a variables de entorno
    const logoUrl = process.env.NEXT_PUBLIC_LOGO;
    const logoLightUrl = process.env.NEXT_PUBLIC_LOGO_LIGHT;
    const faviconUrl = process.env.NEXT_PUBLIC_LOGO_FAVICON;

    return {
      logo: logoUrl ? getDirectDropboxUrl(logoUrl) : '/LOGO.png',
      logoLight: logoLightUrl ? getDirectDropboxUrl(logoLightUrl) : '/LOGO_LIGHT.png',
      favicon: faviconUrl ? getDirectDropboxUrl(faviconUrl) : '/FAVICON.png',
    };
  }
};

/**
 * Versión sincrónica de getLogoUrls que usa las variables de entorno
 * Para casos donde se necesita acceso inmediato sin async
 */
export const getLogoUrlsSync = () => {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO;
  const logoLightUrl = process.env.NEXT_PUBLIC_LOGO_LIGHT;
  const faviconUrl = process.env.NEXT_PUBLIC_LOGO_FAVICON;

  return {
    logo: logoUrl ? getDirectDropboxUrl(logoUrl) : '/LOGO.png',
    logoLight: logoLightUrl ? getDirectDropboxUrl(logoLightUrl) : '/LOGO_LIGHT.png',
    favicon: faviconUrl ? getDirectDropboxUrl(faviconUrl) : '/FAVICON.png',
  };
};

export default {
  getDropboxInstance,
  getDirectDropboxUrl,
  getFileMetadata,
  listFiles,
  getTemporaryLink,
  extractFileId,
  getLogoUrls,
};