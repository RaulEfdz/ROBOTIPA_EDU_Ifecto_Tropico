import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CommunicationPreferencesForm from "./steps/CommunicationPreferencesForm";
import ObjectAcademiInformation from "./steps/ObjectAcademiInformation";
import PersonalInformation from "./steps/PersonalInformation";


const formSchema = z.object({
  nombreCompleto: z.string().min(2, { message: "Nombre muy corto." }),
  correoElectronico: z.string().email({ message: "Email inválido." }),
  paisResidencia: z.string().min(2, { message: "País inválido." }),
  edad: z.preprocess(
    (val) => Number(val),
    z.number().min(18, {
      message: "Debes tener al menos 18 años.",
    })
  ),
  genero: z.string().min(1, { message: "Género es obligatorio." }),
  universidad: z.string().min(2, { message: "Universidad inválida." }),
  nivelEstudio: z.string().min(1, { message: "Nivel de estudio es obligatorio." }),
  carrera: z.string().min(1, { message: "Carrera es obligatoria." }),
  areaEspecializacion: z.string().min(2, { message: "Área de especialización inválida." }),
  objetivosAprendizaje: z.array(z.string()).min(1, { message: "Debe elegir al menos un objetivo." }),
  preferenciasComunicacion: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una preferencia." }),
  aceptaTerminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const InscripcionForm: React.FC = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      correoElectronico: "",
      paisResidencia: "",
      edad: 0,
      genero: "",
      universidad: "",
      nivelEstudio: "",
      carrera: "",
      areaEspecializacion: "",
      objetivosAprendizaje: [],
      preferenciasComunicacion: [],
      aceptaTerminos: false,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const onSubmit = (values: FormValues) => {
    // Lógica de envío final
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = [
        "nombreCompleto",
        "correoElectronico",
        "paisResidencia",
        "edad",
        "genero",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "universidad",
        "nivelEstudio",
        "carrera",
        "areaEspecializacion",
        "objetivosAprendizaje",
      ];
    } else if (currentStep === 3) {
      fieldsToValidate = ["preferenciasComunicacion", "aceptaTerminos"];
    }

    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="w-full bg-gray-300 h-2 rounded">
          <div
            className="bg-[#386329] h-2 rounded"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-right text-sm mt-1">
          Paso {currentStep} de {totalSteps}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && <PersonalInformation form={form} />}
          {currentStep === 2 && <ObjectAcademiInformation form={form} />}
          {currentStep === 3 && <CommunicationPreferencesForm form={form} />}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button type="button" onClick={handlePrevious}>
                Anterior
              </Button>
            )}
            <Button type="button" onClick={handleNext}>
              {currentStep === totalSteps ? "Enviar" : "Siguiente"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InscripcionForm;
