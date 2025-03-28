
export const isTeacher = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    console.error("NEXT_PUBLIC_APP_URL no está definido.");
    return false;
  }

  try {
    const response = await fetch(appUrl+"/api/auth/getUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });



    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.error("La respuesta del servidor no es un JSON válido:", jsonError);
        return false;
      }

      // console.error(`Error del servidor: ${errorData?.error || "Error desconocido"}`);
      return false;
    }

    const data = await response.json();
    const state =
      data.role === "teacher" || data.role === "admin" || data.role === "developer";
    return state;
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error);
    return false;
  }
};
