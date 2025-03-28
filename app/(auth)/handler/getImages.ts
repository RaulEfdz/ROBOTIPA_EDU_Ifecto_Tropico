export const listImgs = async (folderName: string): Promise<string[]> => {
  const response = await fetch("/api/cloudinary/getFolder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder: folderName }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  const data = await response.json();

  // Validar si `data` es un array directamente
  if (!Array.isArray(data)) {
    throw new Error("Invalid response format");
  }

  // Mapear las URLs de las imágenes
  return data.map((image: { url: string }) => image.url);
};
