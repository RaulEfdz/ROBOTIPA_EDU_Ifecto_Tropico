// app/payments/ItemCardPay.tsx
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { handlerCreatePaymentLink } from "./handlerLink";

interface ItemCardProps {
  itemId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

const defaultImage = process.env.NEXT_PUBLIC_PAGUELOFACIL_BTN_ES;

export default function ItemCard({
  itemId,
  name,
  description,
  price,
  imageUrl,
}: ItemCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onPay = () => {
    setError(null);
    const params = {
      amount: price,
      description: `Pago de ${name} (ID: ${itemId})`,
      customParam1: itemId,
      // returnUrl: window.location.origin + "/result",
    };

    startTransition(async () => {
      const result = await handlerCreatePaymentLink(params);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
      {imageUrl && (
        <Image
          src={defaultImage || "/default-image-path.jpg"}
          alt={name}
          width={300}
          height={200}
          style={{ objectFit: "cover" }}
        />
      )}
      <h2>{name}</h2>
      <p>{description}</p>
      <p style={{ fontWeight: "bold" }}>${price.toFixed(2)}</p>
      <button
        onClick={onPay}
        disabled={isPending}
        style={{
          padding: "8px 12px",
          cursor: isPending ? "wait" : "pointer",
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? "Generando enlace…" : "Pagar Ahora"}
      </button>
      {error && <p style={{ color: "red", marginTop: 8 }}>Error: {error}</p>}
    </div>
  );
}
