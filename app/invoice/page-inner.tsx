"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InvoiceDisplay } from "../components/InvoiceDisplay";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [userData, setUserData] = useState<{ fullName: string; email: string }>(
    {
      fullName: "",
      email: "",
    }
  );
  const [courseTitle, setCourseTitle] = useState<string>("");

  useEffect(() => {
    const invoiceId = searchParams?.get("invoiceId");
    const userFullName = searchParams?.get("userFullName") || "";
    const userEmail = searchParams?.get("userEmail") || "";
    const courseId = searchParams?.get("courseId");

    if (!invoiceId || !courseId) {
      // Handle missing params, maybe redirect or show error
      return;
    }

    setUserData({ fullName: userFullName, email: userEmail });

    // Fetch invoice data by invoiceId
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const data = await res.json();
          setInvoiceData(data.invoice);
        } else {
          console.error('Failed to fetch invoice data:', res.status);
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    };

    // Fetch course title
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.title || "Curso desconocido");
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchInvoice();
    fetchCourse();
  }, [searchParams]);

  if (!invoiceData) {
    return <div>Cargando factura...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md">
        <InvoiceDisplay
          invoice={invoiceData}
          user={userData}
          courseTitle={courseTitle}
        />
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.push(`/courses/${invoiceData.data.courseId}`)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            Ir a mi curso
          </Button>
        </div>
      </div>
    </div>
  );
}
