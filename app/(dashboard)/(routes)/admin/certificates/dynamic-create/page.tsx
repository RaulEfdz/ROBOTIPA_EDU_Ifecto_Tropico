"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CertificateGenerator } from "@/components/CertificateGenerator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CertificateFormData {
  studentName: string;
  certificateId: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  institutionName: string;
  duration: string;
  description: string;
  grade: string;
}

interface PositionSettings {
  name: { x: number; y: number };
  certificate: { x: number; y: number };
  course: { x: number; y: number };
  instructor: { x: number; y: number };
  date: { x: number; y: number };
}

interface CertificateSettings {
  unit: "px" | "rem" | "vh";
  baseRem: number;
  downloadFormat: "png" | "jpeg" | "webp";
  quality: number;
  scale: number;
  backgroundColor: string;
  positions: PositionSettings;
}

const DEFAULT_POSITIONS: PositionSettings = {
  name: { x: 300, y: 240 },
  certificate: { x: 300, y: 300 },
  course: { x: 300, y: 200 },
  instructor: { x: 300, y: 340 },
  date: { x: 300, y: 380 },
};

const DEFAULT_SETTINGS: CertificateSettings = {
  unit: "rem",
  baseRem: 16,
  downloadFormat: "png",
  quality: 1.0,
  scale: 2,
  backgroundColor: "#ffffff",
  positions: DEFAULT_POSITIONS,
};

const PRESETS = {
  basic: {
    name: "Básico",
    data: {
      studentName: "Juan Pérez García",
      courseName: "Introducción a la Programación",
      certificateId: "CERT-2024-001",
      issueDate: new Date().toISOString().split("T")[0],
      instructorName: "Dr. María González",
      institutionName: "Instituto Tecnológico",
      duration: "40 horas académicas",
      description: "Ha completado satisfactoriamente el curso",
      grade: "Excelente",
    },
  },
  advanced: {
    name: "Avanzado",
    data: {
      studentName: "Ana Sofía Rodríguez",
      courseName: "Machine Learning y Data Science",
      certificateId: "ML-ADV-2024-045",
      issueDate: new Date().toISOString().split("T")[0],
      instructorName: "PhD. Carlos Mendoza",
      institutionName: "Universidad de Ciencias Aplicadas",
      duration: "120 horas académicas",
      description:
        "Ha demostrado competencia avanzada en análisis de datos y algoritmos de aprendizaje automático",
      grade: "Sobresaliente",
    },
  },
};

export default function DynamicCertificateCreatePage() {
  const certRef = useRef<HTMLDivElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<CertificateFormData>({
    studentName: "",
    certificateId: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    instructorName: "",
    institutionName: "",
    duration: "",
    description: "",
    grade: "",
  });

  // Estado de configuración
  const [settings, setSettings] =
    useState<CertificateSettings>(DEFAULT_SETTINGS);

  // Estados de UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Validación del formulario
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    if (!formData.studentName.trim()) {
      errors.push("El nombre del estudiante es obligatorio");
    }

    if (!formData.courseName.trim()) {
      errors.push("El nombre del curso es obligatorio");
    }

    if (!formData.issueDate) {
      errors.push("La fecha de emisión es obligatoria");
    }

    if (formData.certificateId && formData.certificateId.length < 3) {
      errors.push("El código del certificado debe tener al menos 3 caracteres");
    }

    return errors;
  }, [formData]);

  // Efecto para validación en tiempo real
  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
  }, [validateForm]);

  // Manejo de cambios en el formulario
  const handleInputChange = useCallback(
    (field: keyof CertificateFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setDownloadSuccess(false);
    },
    []
  );

  // Aplicar preset
  const applyPreset = useCallback((presetKey: keyof typeof PRESETS) => {
    setFormData(PRESETS[presetKey].data);
  }, []);

  // Generar ID automático
  const generateAutoId = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    const autoId = `CERT-${timestamp}-${random}`.toUpperCase();
    handleInputChange("certificateId", autoId);
  }, [handleInputChange]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData({
      studentName: "",
      certificateId: "",
      courseName: "",
      issueDate: new Date().toISOString().split("T")[0],
      instructorName: "",
      institutionName: "",
      duration: "",
      description: "",
      grade: "",
    });
    setDownloadSuccess(false);
  }, []);

  // Manejo de configuración
  const updateSettings = useCallback(
    (updates: Partial<CertificateSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Callbacks para el generador
  const handleDownloadStart = useCallback(() => {
    setIsGenerating(true);
    setDownloadSuccess(false);
  }, []);

  const handleDownloadComplete = useCallback((success: boolean) => {
    setIsGenerating(false);
    setDownloadSuccess(success);
    if (success) {
      // Auto-scroll hacia arriba para mostrar el éxito
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 500);
    }
  }, []);

  const handleDownloadError = useCallback((error: Error) => {
    console.error("Error al descargar:", error);
    alert(`Error al generar el certificado: ${error.message}`);
  }, []);

  const isFormValid =
    validationErrors.length === 0 &&
    formData.studentName &&
    formData.courseName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            Generador de Certificados Dinámico
          </h1>
          <p className="text-gray-600 text-lg">
            Crea certificados profesionales personalizados en tiempo real
          </p>
        </div>

        {/* Alert de éxito */}
        {downloadSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✅ ¡Certificado generado y descargado exitosamente!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel de Configuración */}
          <div className="space-y-6">
            {/* Presets */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🎯 Plantillas Rápidas
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof PRESETS)}
                    className="flex items-center gap-2"
                  >
                    ⚡ {preset.name}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  🗑️ Limpiar
                </Button>
              </div>
            </Card>

            {/* Formulario Principal */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📝 Información Principal
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName" className="text-sm font-medium">
                    Nombre del Estudiante *
                  </Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) =>
                      handleInputChange("studentName", e.target.value)
                    }
                    placeholder="Ej: Juan Pérez García"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="courseName" className="text-sm font-medium">
                    Nombre del Curso *
                  </Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) =>
                      handleInputChange("courseName", e.target.value)
                    }
                    placeholder="Ej: Desarrollo Web Avanzado"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="certificateId"
                    className="text-sm font-medium"
                  >
                    Código del Certificado
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="certificateId"
                      value={formData.certificateId}
                      onChange={(e) =>
                        handleInputChange("certificateId", e.target.value)
                      }
                      placeholder="Ej: CERT-2024-001"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAutoId}
                      title="Generar código automático"
                    >
                      🎲
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="issueDate" className="text-sm font-medium">
                    Fecha de Emisión *
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="instructorName"
                    className="text-sm font-medium"
                  >
                    Nombre del Instructor
                  </Label>
                  <Input
                    id="instructorName"
                    value={formData.instructorName}
                    onChange={(e) =>
                      handleInputChange("instructorName", e.target.value)
                    }
                    placeholder="Ej: Dr. María González"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="institutionName"
                    className="text-sm font-medium"
                  >
                    Institución
                  </Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) =>
                      handleInputChange("institutionName", e.target.value)
                    }
                    placeholder="Ej: Instituto Tecnológico"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duración
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    placeholder="Ej: 40 horas académicas"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="grade" className="text-sm font-medium">
                    Calificación
                  </Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Sobresaliente">
                        Sobresaliente
                      </SelectItem>
                      <SelectItem value="Notable">Notable</SelectItem>
                      <SelectItem value="Bien">Bien</SelectItem>
                      <SelectItem value="Aprobado">Aprobado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descripción adicional del logro o competencias adquiridas..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </Card>

            {/* Configuración Avanzada */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  ⚙️ Configuración Avanzada
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? "Ocultar" : "Mostrar"}
                </Button>
              </div>

              {showAdvancedSettings && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Formato de Descarga
                      </Label>
                      <Select
                        value={settings.downloadFormat}
                        onValueChange={(value: "png" | "jpeg" | "webp") =>
                          updateSettings({ downloadFormat: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">
                            PNG (Mejor calidad)
                          </SelectItem>
                          <SelectItem value="jpeg">
                            JPEG (Menor tamaño)
                          </SelectItem>
                          <SelectItem value="webp">
                            WebP (Balanceado)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Calidad ({Math.round(settings.quality * 100)}%)
                      </Label>
                      <Input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.quality}
                        onChange={(e) =>
                          updateSettings({
                            quality: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Escala de Resolución ({settings.scale}x)
                      </Label>
                      <Input
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={settings.scale}
                        onChange={(e) =>
                          updateSettings({ scale: parseFloat(e.target.value) })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Color de Fondo
                      </Label>
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) =>
                          updateSettings({ backgroundColor: e.target.value })
                        }
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Errores de Validación */}
            {validationErrors.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription>
                  <div className="text-red-800">
                    <p className="font-medium mb-2">
                      Por favor corrige los siguientes errores:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Estado */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={isFormValid ? "default" : "secondary"}>
                {isFormValid
                  ? "✅ Listo para generar"
                  : "⚠️ Completa los campos requeridos"}
              </Badge>
              {isGenerating && (
                <Badge variant="outline" className="animate-pulse">
                  🔄 Generando...
                </Badge>
              )}
            </div>
          </div>

          {/* Vista Previa */}
          <div className="lg:sticky lg:top-8">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  👀 Vista Previa en Vivo
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  El certificado se escala automáticamente para ajustarse al
                  contenedor
                </p>
              </div>
              {/* Contenedor de vista previa con altura fija y scroll */}
              <div className="relative bg-gray-100" style={{ height: "500px" }}>
                <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
                  <div
                    className="bg-white shadow-xl rounded-lg overflow-hidden"
                    style={{
                      width: "fit-content",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      transform: "scale(0.4)", // Escala fija para vista previa
                      transformOrigin: "center center",
                    }}
                  >
                    <div style={{ width: "1123px", height: "794px" }}>
                      <CertificateGenerator
                        certRef={certRef}
                        studentName={
                          formData.studentName || "Nombre del Estudiante"
                        }
                        certificateId={formData.certificateId || "CERT-XXXX"}
                        courseName={formData.courseName || "Nombre del Curso"}
                        templateProps={{
                          ...formData,
                          studentName:
                            formData.studentName || "Nombre del Estudiante",
                          certificateId: formData.certificateId || "CERT-XXXX",
                          courseName: formData.courseName || "Nombre del Curso",
                        }}
                        unit={settings.unit}
                        baseRem={settings.baseRem}
                        positions={settings.positions}
                        downloadFormat={settings.downloadFormat}
                        quality={settings.quality}
                        scale={settings.scale}
                        backgroundColor={settings.backgroundColor}
                        onDownloadStart={handleDownloadStart}
                        onDownloadComplete={handleDownloadComplete}
                        onDownloadError={handleDownloadError}
                        showPreview={false} // Desactivar preview interno
                        maxWidth="1123px"
                        style={{
                          width: "1123px",
                          height: "794px",
                          overflow: "visible",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Indicador de escala */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  Vista previa: 40%
                </div>
                {/* Botón de vista completa */}
                <button
                  onClick={() => {
                    // Abrir modal o nueva ventana con vista completa
                    const printWindow = window.open("", "_blank");
                    if (printWindow && certRef.current) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Vista Completa - Certificado</title>
                            <style>
                              body { 
                                margin: 0; 
                                padding: 20px; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                min-height: 100vh; 
                                background: #f5f5f5; 
                              }
                              .certificate { 
                                box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
                                border-radius: 8px; 
                                overflow: hidden; 
                              }
                            </style>
                          </head>
                          <body>
                            <div class="certificate">
                              ${certRef.current.innerHTML}
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  🔍 Ver tamaño real
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
