"use client";

import React from "react";
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";

// Paleta de marca
const brandPrimary = "#FFFCF8";
const brandSecondaryDark = "#47724B";
const brandSecondary = "#ACBC64";
const brandTertiaryDark = "#386329";
const brandTertiary = "#C8E065";

const textContent = {
  es: {
    pageTitle: "Crea tu Curso",
    pageDescription:
      "Dale un nombre atractivo a tu curso. Puedes cambiarlo más tarde.",
    titleLabel: "Título del Curso",
    titlePlaceholder: "ej., 'Capacitación en habilidades avanzadas'",
    titleDescription: "Describe lo que abordarás en este curso.",
    cancelButton: "Cancelar",
    continueButton: "Continuar",
    successMessage: "Curso creado",
    errorMessage: "Algo salió mal",
  },
};

const formSchema = z.object({
  title: z.string().min(1, {
    message: "El título es obligatorio",
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const language = "es";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);
      router.push(`/teacher/courses/${response.data.id}`);
      toast.success(textContent[language].successMessage);
    } catch {
      toast.error(textContent[language].errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom, ${brandPrimary}, ${brandTertiary}33)`,
      }}
    >
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-transparent hover:text-[${brandTertiaryDark}] transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Pencil className="h-6 w-6" style={{ color: brandSecondaryDark }} />
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                {textContent[language].pageTitle}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {textContent[language].pageDescription}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-700">
                      {textContent[language].titleLabel}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder={textContent[language].titlePlaceholder}
                        {...field}
                        className="h-12 text-lg bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(172,188,100,0.5)] focus:border-[${brandSecondary}] transition"
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500">
                      {textContent[language].titleDescription}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Link href="/" passHref>
            <Button
              variant="outline"
              type="button"
              className="w-32 border border-gray-300 hover:bg-gray-50"
            >
              {textContent[language].cancelButton}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="w-32 bg-[${brandSecondary}] hover:bg-[${brandTertiary}] text-black font-medium shadow-sm transition"
          >
            {textContent[language].continueButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePage;
