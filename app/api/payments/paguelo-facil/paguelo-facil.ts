// app/api/payments/paguelo-facil/paguelo-facil.ts
"use server";

interface PagueloFacilResponse {
  headerStatus: { code: number; description: string };
  serverTime: string;
  message: string | null;
  data: { url?: string; code?: string } | {};
  success: boolean;
}

export interface CreatePaymentLinkParams {
  amount: number;
  description: string;
  returnUrl?: string; // URL en texto plano; se hexifica internamente
  customParam1?: string; // PARM_1
  pfCf?: Record<string, any>; // PF_CF como objeto JSON
  ctax?: number; // CTAX (impuesto)
  cardTypes?: string[]; // CARD_TYPE (e.g. ["VISA","NEQUI"])
  expiresIn?: number; // EXPIRES_IN en segundos
}

function toHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex");
}

export async function createPagueloFacilLink(
  params: CreatePaymentLinkParams
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  // LOG para depuración
  console.log('[PagueloFacil] params recibidos:', params);
  const cclw = process.env.PAGUELOFACIL_CCLW;
  const apiUrl = process.env.PAGUELOFACIL_API_URL;
  const defaultExpires = parseInt(
    process.env.PAGUELOFACIL_EXPIRES_IN || "3600",
    10
  );

  if (!cclw || !apiUrl) {
    return { success: false, error: "Configuración del servidor incompleta." };
  }

  if (params.amount < 1.0 || !params.description) {
    return {
      success: false,
      error: "Monto y descripción son requeridos. El monto mínimo es $1.00.",
    };
  }

  const data: Record<string, string> = {
    CCLW: cclw,
    CMTN: params.amount.toFixed(2),
    CDSC: params.description.substring(0, 150),
    EXPIRES_IN: String(params.expiresIn ?? defaultExpires),
  };

  if (params.returnUrl) {
    console.log(
      `Generando enlace de pago con URL de retorno: ${params.returnUrl}`
    );
    data.RETURN_URL = toHex(params.returnUrl);
  }
  if (params.customParam1) {
    data.PARM_1 = params.customParam1.substring(0, 150);
  }
  if (params.ctax !== undefined) {
    data.CTAX = params.ctax.toFixed(2);
  }
  if (params.pfCf) {
    try {
      const json = JSON.stringify(params.pfCf);
      data.PF_CF = toHex(json);
    } catch {
      return { success: false, error: "PF_CF debe ser un objeto JSON válido." };
    }
  }
  if (params.cardTypes && params.cardTypes.length) {
    data.CARD_TYPE = params.cardTypes.join(",");
  }

  const body = Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
      },
      body,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Error desconocido");
      return {
        success: false,
        error: `HTTP ${res.status} al comunicarse con el servicio de pago: ${text}`,
      };
    }

    const result = (await res.json()) as PagueloFacilResponse;
    if (result.success && "url" in result.data && result.data.url) {
      return { success: true, url: result.data.url };
    } else {
      const msg =
        result.message ||
        result.headerStatus.description ||
        "Error desconocido al generar el enlace.";
      return {
        success: false,
        error: `Payfacil: ${msg} (Código ${result.headerStatus.code})`,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      error: `No se pudo conectar con Payfacil: ${e.message}`,
    };
  }
}
