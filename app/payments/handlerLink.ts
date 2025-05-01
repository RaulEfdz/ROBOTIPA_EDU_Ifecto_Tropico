// app/payments/handlerLink.ts
export interface CreatePaymentLinkParams {
  amount: number;
  description: string;
  returnUrl?: string;
  customParam1?: string;
  // pfCf, ctax, cardTypes… si los necesitas
}

interface ApiResponse {
  url?: string;
  error?: string;
}

export async function handlerCreatePaymentLink(
  params: CreatePaymentLinkParams
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch("/api/payments/paguelo-facil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const result = (await res.json()) as ApiResponse;
    if (res.ok && result.url) {
      window.location.href = result.url;
      return { success: true };
    } else {
      return {
        success: false,
        error:
          result.error ||
          `Error ${res.status}: no se generó el enlace de pago.`,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      error: `Error de conexión al generar el pago: ${e.message}`,
    };
  }
}
