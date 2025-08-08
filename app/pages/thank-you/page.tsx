"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  Play,
  Download,
} from "lucide-react";
import Image from "next/image";
import { InvoiceDisplay } from "@/app/components/InvoiceDisplay";
import { toPng } from "html-to-image";

type Status = "success" | "error" | "loading" | "invalid-params";

export default function ThankYouPage() {
  const router = useRouter();

  const invoiceRef = useRef<HTMLDivElement>(null);

  const [statusVisual, setStatusVisual] = useState<Status>("loading");
  const [courseName, setCourseName] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>(
    {}
  );

  // Campos que no deben mostrarse en detalles de pago
  // const excludedFields = ["cclw", "Estado", "Razon", "CDSC"];
  const [statusParam, setStatusParam] = useState<string | undefined>();
  const [courseId, setCourseId] = useState<string | undefined>();
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Función auxiliar para parsear cualquier URL a un objeto { clave: valor }
  function obtenerParametrosDeUrl(fullUrl: string): Record<string, string> {
    try {
      const urlObj = new URL(fullUrl);
      const params = urlObj.searchParams;
      const resultado: Record<string, string> = {};

      for (const [clave, valor] of Array.from(params.entries())) {
        resultado[clave] = valor;
      }
      return resultado;
    } catch (e) {
      // Si el constructor URL falla, lo parseamos manualmente:
      const resultado: Record<string, string> = {};
      const indiceSigno = fullUrl.indexOf("?");
      if (indiceSigno === -1) return resultado;

      const queryString = fullUrl.slice(indiceSigno + 1);
      const pares = queryString.split("&");

      for (const par of pares) {
        if (!par) continue;
        const [claveRaw, valorRaw = ""] = par.split("=");
        const clave = decodeURIComponent(claveRaw.replace(/\+/g, " "));
        const valor = decodeURIComponent(valorRaw.replace(/\+/g, " "));
        resultado[clave] = valor;
      }
      return resultado;
    }
  }

  // Este efecto se ejecuta una sola vez (al montar el componente)
  // Toma window.location.href, extrae todos los parámetros y los guarda en state
  useEffect(() => {
    // Asegurarnos de que 'window' exista (solo en cliente)
    if (typeof window === "undefined") return;

    const fullUrl = window.location.href;
    const detalles = obtenerParametrosDeUrl(fullUrl);


    // Guardamos todos los parámetros para poder listarlos en la UI
    setPaymentDetails(detalles);

    // Extraemos explícitamente course y RelatedTx (paymentId) del objeto resultante
    const rawCourse = detalles["course"] || detalles["COURSE"] || undefined;
    const paymentId =
      detalles["RelatedTx"] || detalles["relatedtx"] || undefined;
    setCourseId(rawCourse);

    // Si ya hay un paymentId, verificar si la factura ya existe
    if (paymentId) {
      fetch(`/api/invoices/${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.found) {
            setInvoiceData(data.invoice);
            setStatusVisual("success");
            setValidationMessage(
              "El pago ya fue procesado. Aquí está su comprobante."
            );
          } else {
            // Si no existe factura, continuar con el flujo normal
            if (!rawCourse) {
              setStatusVisual("invalid-params");
              setValidationMessage(
                "Faltan parámetros requeridos (course) en la URL."
              );
              return;
            }
            setStatusVisual("loading");
          }
        })
        .catch(() => {
          // En caso de error, continuar con flujo normal
          if (!rawCourse) {
            setStatusVisual("invalid-params");
            setValidationMessage(
              "Faltan parámetros requeridos (course) en la URL."
            );
            return;
          }
          setStatusVisual("loading");
        });
    } else {
      // Si no hay paymentId, validar que course esté presente
      if (!rawCourse) {
        setStatusVisual("invalid-params");
        setValidationMessage(
          "Faltan parámetros requeridos (course) en la URL."
        );
        return;
      }
      setStatusVisual("loading");
    }
  }, []);

  // Efecto que se encarga de validar el pago, registrar pago, generar factura e inscribir al usuario
  useEffect(() => {
    if (
      statusVisual !== "loading" ||
      !courseId ||
      validationMessage ===
        "El pago ya fue procesado. Aquí está su comprobante." ||
      invoiceData !== null
    ) {
      return;
    }

    const processPayment = async () => {
      try {
        // 1. Obtener info del curso para mostrar nombre
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.title || "Curso desconocido");
        } else {
          setCourseName("Curso no encontrado");
        }

        // 2. Validar el pago en backend con todos los parámetros de la URL
        const queryParams = new URLSearchParams(window.location.search);
        const validateRes = await fetch(
          `/api/courses/${courseId}/validate-payment?${queryParams.toString()}`
        );
        const validateData = await validateRes.json();

        if (!validateRes.ok || !validateData.valid) {
          setValidationMessage(
            validateData.message || "No se ha verificado el pago."
          );
          setStatusVisual("error");
          return;
        }

        // 3. Registrar el pago en backend (suponiendo que validate-payment crea el pago)
        // Si no, aquí se podría hacer un fetch POST para registrar el pago explícitamente

        // 4. Generar la factura llamando al nuevo endpoint POST
        const paymentId = validateData.paymentId || null; // Asumir que validate-payment devuelve paymentId
        const userId = validateData.userId || null; // Asumir que validate-payment devuelve userId
        const concept = `Factura por curso ${courseName}`;
        const amount = parseFloat(queryParams.get("TotalPagado") || "0");
        const currency = "USD"; // Ajustar según sea necesario
        const paymentMethod = queryParams.get("Tipo") || "Desconocido";

        if (!paymentId || !userId) {
          setValidationMessage("Datos insuficientes para generar factura.");
          setStatusVisual("error");
          return;
        }

        const invoiceRes = await fetch(`/api/courses/${courseId}/invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            userId,
            concept,
            amount,
            currency,
            paymentMethod,
          }),
        });

        const invoiceData = await invoiceRes.json();

        if (!invoiceRes.ok || !invoiceData.success) {
          setValidationMessage(
            invoiceData.message || "Error al generar la factura."
          );
          setStatusVisual("error");
          return;
        }

        // 5. Inscribir al usuario
        const enrollRes = await fetch(`/api/courses/${courseId}/enroll`, {
          method: "POST",
        });
        const enrollData = await enrollRes.json();

        if (enrollRes.ok) {
          toast.success("¡Inscripción completada con éxito!");
          setStatusVisual("success");
          setValidationMessage("Inscripción completada exitosamente.");
          setInvoiceData(invoiceData.invoice);
        } else {
          setValidationMessage(
            enrollData.error || "No se pudo inscribir al curso."
          );
          setStatusVisual("error");
        }
      } catch (err) {
        console.error("Error en el proceso de pago:", err);
        setValidationMessage("Error de conexión al procesar el pago.");
        setStatusVisual("error");
      }
    };

    processPayment();
  }, [statusVisual, courseId, validationMessage, invoiceData, courseName]);

  // Polling para consultar el estado del pago usando el ID de operación (Oper)
  useEffect(() => {
    const operId = paymentDetails["Oper"] || paymentDetails["oper"];
    if (
      !operId ||
      statusVisual === "success" ||
      statusVisual === "invalid-params"
    )
      return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoices/${operId}`);
        const data = await res.json();
        if (data.found && data.invoice?.status === "APROBADA") {
          setInvoiceData(data.invoice);
          setStatusVisual("success");
        }
      } catch (err) {
        // Ignorar errores de polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentDetails, statusVisual, courseName]);

  // Componente para mostrar los detalles de la URL
  const PaymentDetailsSection = () => {
    // Lista de campos a excluir
    const excludedFields = [
      "cclw",
      "estado",
      "razon",
      "cdsc",
      "status",
      "relatedtx",
      "cmtn",
      "operacion",
      "parm_1",
      "course",
    ];

    // Filtrar para no mostrar los campos excluidos
    const filteredDetails = Object.entries(paymentDetails).filter(
      ([key]) => !excludedFields.includes(key.toLowerCase())
    );

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 w-full">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Detalles del Pago
        </h2>
        {filteredDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {filteredDetails.map(([key, value]) => {
              // Formatear algunos campos específicos para mejor legibilidad
              let displayKey = key;
              let displayValue: string | JSX.Element = value || "(vacío)";

              switch (key.toLowerCase()) {
                case "totalpagado":
                  displayKey = "Total Pagado";
                  displayValue = `${value}`;
                  break;
                case "fecha":
                  displayKey = "Fecha";
                  break;
                case "hora":
                  displayKey = "Hora";
                  displayValue = decodeURIComponent(value);
                  break;
                case "tipo":
                  displayKey = "Tipo de Tarjeta";
                  break;
                case "oper":
                  displayKey = "Operación";
                  break;
                case "usuario":
                  displayKey = "Usuario";
                  displayValue = decodeURIComponent(value.replace(/\+/g, " "));
                  break;
                case "email":
                  displayKey = "Email";
                  displayValue = decodeURIComponent(value);
                  break;
              }

              return (
                <div
                  key={key}
                  className="bg-white p-3 rounded border border-gray-100"
                >
                  <div className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">
                    {displayKey}
                  </div>
                  <div className="text-gray-700 break-all font-mono text-xs">
                    {typeof displayValue === "string"
                      ? displayValue
                      : displayValue}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No se encontraron parámetros en la URL.
          </p>
        )}
        {validationMessage && statusVisual !== "success" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-800">
                Estado de Validación
              </p>
            </div>
            <p className="text-sm text-blue-700">{validationMessage}</p>
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar contenido según el estado
  const renderContent = () => {
    switch (statusVisual) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute w-16 h-16 border-4 border-t-primary-500 rounded-full animate-spin"></div>
              <Loader2 className="w-8 h-8 text-primary-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Procesando tu inscripción
            </h1>
            <p className="text-gray-600 max-w-sm text-center">
              Estamos registrando tu inscripción al curso{" "}
              {courseName || courseId}, por favor espera un momento...
            </p>
            {/* Mensaje adicional mientras se consulta el estado del pago */}
            <div className="mt-2 text-sm text-blue-600 text-center animate-pulse">
              <span>
                Verificando el estado de tu pago. Esto puede tardar unos minutos
                si tu banco aún no ha confirmado la transacción.
                <br />
                No cierres esta ventana.
              </span>
            </div>
            <PaymentDetailsSection />
          </div>
        );

      case "success":
        if (
          validationMessage ===
          "El pago ya fue procesado. Aquí está su comprobante."
        ) {
          // Only show minimal or no content here, receipt is shown outside
          return null;
        }
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-primary-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <CheckCircle className="text-primary-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 w-full text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-gray-600">
                Tu inscripción al curso{" "}
                <span className="font-semibold">{courseName}</span> se ha
                registrado correctamente.
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );

      case "invalid-params":
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <AlertCircle className="text-orange-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Parámetros inválidos
              </h1>
              <p className="text-gray-600 max-w-sm">
                La URL no contiene los parámetros necesarios para procesar tu
                solicitud.
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses/catalog")}
                className="bg-primary-600 hover:bg-primary-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ver cursos disponibles
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );

      case "error":
      default:
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-300 to-red-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <XCircle className="text-red-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                No se pudo completar
              </h1>
              <p className="text-gray-600 max-w-sm">
                Hubo un problema con tu inscripción o validación del pago.
                {courseName && ` Curso: ${courseName}`}
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses/catalog")}
                className="bg-primary-600 hover:bg-primary-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ver otros cursos
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );
    }
  };

  const handleDownload = async () => {
    if (invoiceRef.current === null) {
      return;
    }
    try {
      const dataUrl = await toPng(invoiceRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = "comprobante-pago.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al descargar la imagen:", error);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* ==================== Logo Section ==================== */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Logo"
          width={700}
          height={700}
          className="h-64 w-auto object-contain"
        />
      </div>

      {invoiceData && statusVisual === "success" ? (
        <>
          {/* =============== Texto motivacional =============== */}
          <p className="text-center text-gray-600 font-medium mb-4">
            Tu aventura de aprendizaje te está esperando 🚀
          </p>

          {/* ============ Contenedor del Comprobante ============ */}
          <div
            ref={invoiceRef}
            className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-shadow duration-300 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-center">
              Comprobante de Pago Generado
            </h2>
            <InvoiceDisplay
              invoice={invoiceData}
              user={{
                fullName: paymentDetails["Usuario"] || "",
                email: paymentDetails["Email"] || "",
              }}
              courseTitle={courseName}
            />
          </div>

          {/* ============= Botón “Comenzar mi curso” ============= */}
          <div className="w-full max-w-3xl">
            <div className="relative group">
              {/* Glow animado (efecto “pulso”) */}
              <div className="absolute inset-0 rounded-xl opacity-0 bg-gradient-to-r from-primary-400 via-green-500 to-primary-600 blur-lg transition-opacity duration-1000 group-hover:opacity-75 animate-pulse pointer-events-none"></div>

              {/* Botón principal */}
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="relative z-10 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg overflow-hidden"
              >
                <div className="bg-white/20 rounded-full p-2">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <span>¡Comenzar mi curso ahora!</span>

                {/* Overlay sutil al hacer hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
              </button>
            </div>
          </div>

          {/* ============= Botón “Descargar Comprobante” ============= */}
          <div className="mt-6 w-full max-w-3xl">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              <Download className="h-5 w-5" />
              Descargar Comprobante (PNG)
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 w-full max-w-3xl">{renderContent()}</div>
      )}

      {/* ==================== Pie de página ==================== */}
      <p className="mt-8 text-sm text-gray-500 text-center max-w-md">
        Si tienes alguna pregunta sobre tu compra o necesitas ayuda, no dudes en
        contactarnos.
      </p>
    </div>
  );
}
