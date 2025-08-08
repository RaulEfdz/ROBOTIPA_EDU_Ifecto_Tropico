"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RedirectModal from "../pages/course/[courseId]/components/RedirectModal";
import DevPaymentControls from "../pages/course/[courseId]/components/dev/DevPaymentControls";
import MockPaymentButton from "./MockPaymentButton";

interface Props {
  amount: number;
  description: string;
  courseId: string;
  isFree: boolean;
}

export default function PaymentButton({
  amount,
  description,
  courseId,
  isFree,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [enrolledAt, setEnrolledAt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/is-enrolled`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data.enrolled) {
          setAlreadyPurchased(true);
          setEnrolledAt(data.enrolledAt || null);
        }
      } catch (err) {
        // Silent failure - enrollment check is not critical for UI
      }
    };

    checkPurchase();
  }, [courseId]);

  const handlePaidCourse = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUserFromDB();
      if (!user || user.isDeleted || user.isBanned) {
        toast.error("No se pudo obtener información válida del usuario.");
        return;
      }

      // Fetch first chapter ID
      const courseRes = await fetch(
        `/api/courses/${courseId}/published-chapters`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      if (!courseRes.ok) {
        toast.error("No se pudo obtener información del curso.");
        setLoading(false);
        return;
      }
      const courseData = await courseRes.json();
      const firstChapterId =
        courseData.chapters && courseData.chapters.length > 0
          ? courseData.chapters[0].id
          : null;

      if (!firstChapterId) {
        toast.error("No se encontró el primer capítulo del curso.");
        setLoading(false);
        return;
      }

      const returnUrl = `${window.location.origin}/courses/${courseId}/chapters/${firstChapterId}?status=SUCCESS&course=${courseId}`;

      const payload = {
        amount,
        description,
        customParam1: user.id,
        returnUrl,
        pfCf: {
          email: user.email,
          phone: user.phone || "",
          fullName: user.fullName,
          courseId,
        },
        metadata: {
          courseId,
        },
        cardTypes: ["VISA", "MASTERCARD", "NEQUI"],
      };

      const res = await fetch("/api/payments/paguelo-facil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setRedirectUrl(data.url);
      } else {
        toast.error(data.error || "No se pudo generar el enlace de pago.");
      }
    } catch (e) {
      toast.error("Error inesperado al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!alreadyPurchased ? null : (
        <div className="w-full text-center border border-gray-200 rounded-lg p-2 text-sm text-gray-600 bg-gray-50">
          <ShieldCheck className="inline-block mr-1 text-primary-500 w-4 h-4" />
          Ya estás inscrito en este curso
          {enrolledAt && (
            <div className="mt-1 text-xs text-gray-500">
              Inscrito desde: {new Date(enrolledAt).toLocaleDateString("es-ES")}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        {/* Removed MockPaymentButton as it is not appropriate here */}
      </div>

      {process.env.NODE_ENV === "development" && (
        <DevPaymentControls
          courseId={courseId}
          onEnrollSuccess={() => {
            setAlreadyPurchased(true);
            setEnrolledAt(new Date().toISOString());
            router.push(`/pages/thank-you?status=SUCCESS&course=${courseId}`);
          }}
          onUnenrollSuccess={() => {
            setAlreadyPurchased(false);
            setEnrolledAt(null);
          }}
        />
      )}

      {redirectUrl && (
        <RedirectModal url={redirectUrl} onClose={() => setRedirectUrl(null)} />
      )}
    </>
  );
}
