import React from "react";

interface InvoiceDisplayProps {
  invoice: {
    id: string;
    concept: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    issuedAt: string;
    paidAt?: string | null;
    data: {
      courseId: string;
      paymentId: string;
    };
  };
  user: {
    fullName: string;
    email: string;
  };
  courseTitle: string;
}

export const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  invoice,
  user,
  courseTitle,
}) => {
  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString();
  const paidDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString()
    : "Pendiente";

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl">
            Comprobante de Pago:
            <label className="font-bold"> #{invoice.id.slice(0, 8)}</label>
          </h1>
          {invoice.status === "issued" && invoice.paidAt && (
            <p className="text-green-600 font-semibold mt-1">
              Ya esto ha sido pagado
            </p>
          )}
          <p className="text-sm text-gray-600">Curso: {courseTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Emitida: {issuedDate}</p>
          <p className="text-sm">Pagada: {paidDate}</p>
          <p className="text-sm">Estado: {invoice.status}</p>
        </div>
      </header>

      {invoice && (
        <section key={invoice.id} className="mb-6">
          <h2 className="font-semibold mb-2">Detalles del Pago</h2>
          <p>
            <strong>Método:</strong> {invoice.paymentMethod}
          </p>
          <p>
            <strong>Concepto:</strong> {invoice.concept}
          </p>
          <p>
            <strong>Monto:</strong> {invoice.amount.toFixed(2)}{" "}
            {invoice.currency}
          </p>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-2">Cliente</h2>
        <p>{user.fullName}</p>
        <p>{user.email}</p>
      </section>
    </div>
  );
};
