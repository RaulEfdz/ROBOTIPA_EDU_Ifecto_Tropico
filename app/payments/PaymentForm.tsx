// app/payments/PaymentForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  amount: number;
  description: string;
  onCancel: () => void;
}

export default function PaymentForm({ amount, description, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, email, phone }),
      });
      const { paymentUrl, error } = await res.json();
      if (paymentUrl) window.location.href = paymentUrl;
      else alert("Error: " + error);
    } catch {
      alert("Error inesperado al iniciar pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-sm mx-auto space-y-4">
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded p-2"
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border rounded p-2"
      />
      <Button onClick={submit} disabled={!email || !phone || loading}>
        {loading ? "Procesando..." : "Pagar"}
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
