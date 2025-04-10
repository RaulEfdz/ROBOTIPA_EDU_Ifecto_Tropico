import { db } from "@/lib/db";

interface InvoiceData {
  userId: string;
  concept: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;  // Propiedad agregada según el modelo
  issuedAt: Date;
  paidAt?: Date | null;
  data?: Record<string, any>;
}

export async function registerUserInvoices(invoices: InvoiceData[]) {
  const createdInvoices = [];

  for (const invoice of invoices) {
    const created = await db.invoice.create({
      data: {
        userId: invoice.userId,
        concept: invoice.concept,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        paymentMethod: invoice.paymentMethod, // Se asigna la propiedad requerida
        issuedAt: invoice.issuedAt,
        paidAt: invoice.paidAt ?? null,
        data: invoice.data ?? {},
      },
    });

    createdInvoices.push(created);
  }

  return createdInvoices;
}
