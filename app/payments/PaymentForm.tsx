// app/payments/PaymentForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Course } from "@/prisma/types";

interface Props {
  amount: number;
  description: string;
  onCancel: () => void;
  course: Course;
}

export default function PaymentForm({
  amount,
  description,
  onCancel,
  course,
}: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      // Fetch first chapter ID
      const courseRes = await fetch(
        `/api/courses/${course.id}/published-chapters`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      if (!courseRes.ok) {
        alert("No se pudo obtener información del curso.");
        setLoading(false);
        return;
      }
      const courseData = await courseRes.json();
      const firstChapterId =
        courseData.chapters && courseData.chapters.length > 0
          ? courseData.chapters[0].id
          : null;

      if (!firstChapterId) {
        alert("No se encontró el primer capítulo del curso.");
        setLoading(false);
        return;
      }
      // const returnUrl = `${window.location.origin}/courses/${course.id}?status=SUCCESS&course=${course.id}`;
      const returnUrl = `${window.location.origin}/pages/thank-you?status=SUCCESS&course=${course.id}`; // Mantener en la misma ruta

      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: `${description} ${course.id}`, // Append course ID to description for validation
          email,
          phone,
          course, // Enviar el curso completo si es necesario
          returnUrl,
        }),
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
