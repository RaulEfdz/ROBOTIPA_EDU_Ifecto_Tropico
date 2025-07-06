"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  amount: number;
  description: string;
}

export default function MockPaymentButton({ amount, description }: Props) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleMockPayment = async () => {
    setLoading(true);
    try {
      // Simulate a delay for payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPaid(true);
      toast.success(
        `Pago simulado exitoso por $${amount.toFixed(2)}: ${description}`
      );
    } catch (error) {
      toast.error("Error en el pago simulado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!paid ? (
        <Button onClick={handleMockPayment} disabled={loading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {loading ? "Procesando..." : `Comprar por $${amount.toFixed(2)}`}
        </Button>
      ) : (
        <div className="w-full text-center border border-green-400 rounded-lg p-2 text-sm text-green-700 bg-primary-100 flex items-center justify-center">
          <CheckCircle className="inline-block mr-1 w-5 h-5" />
          Pago simulado exitoso
        </div>
      )}
    </>
  );
}
