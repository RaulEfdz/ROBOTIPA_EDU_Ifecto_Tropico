"use client";

import React from "react";
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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

const texts = {
  es: {
    pageTitle: "Crea tu curso",
    pageDescription: "Dale un nombre atractivo a tu curso. Puedes cambiarlo más tarde.",
    titleLabel: "Título del curso",
    titlePlaceholder: "ej. 'Capacitación en habilidades avanzadas'",
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
  const lang = "es";
  const t = texts[lang];

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
      toast.success(t.successMessage, {
        duration: 2000,
        position: "bottom-right",
      });
    } catch {
      toast.error(t.errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-[#FFFCF8] to-[#C8E065]/20">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-green-700 dark:hover:text-green-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-green-700 dark:text-green-400" />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {t.pageTitle}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.pageDescription}
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
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.titleLabel}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder={t.titlePlaceholder}
                        className="h-11 text-base border-gray-300 dark:border-gray-700 focus-visible:ring-green-500 dark:bg-gray-800"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      {t.titleDescription}
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
          <Link href="/" passHref>
            <Button
              variant="outline"
              type="button"
              className="w-32 border-gray-200 dark:border-gray-700"
            >
              {t.cancelButton}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="w-32 bg-green-600 hover:bg-green-700 text-white"
          >
            {t.continueButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePage;
