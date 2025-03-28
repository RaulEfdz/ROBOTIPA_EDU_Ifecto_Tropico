import { User } from "../type";



export async function UpdateUser(data: User): Promise<any> {
  try {
    const response = await fetch("/api/auth/editUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // No es necesario envolver "data" en otro objeto si ya es el payload directo
    });

    if (!response.ok) {
      const errorMessage = await response.text(); // Obtener detalles del error si es posible
      throw new Error(`Error: ${response.status} - ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unexpected error occurred"
    );
  }
}
