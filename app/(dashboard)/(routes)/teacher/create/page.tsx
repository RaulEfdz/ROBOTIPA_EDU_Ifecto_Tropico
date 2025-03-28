"use client";

import React from 'react';
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { Moon, Sun, Pencil, ArrowLeft } from "lucide-react";

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
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { zodResolver } from '@hookform/resolvers/zod';

const textContent = {
  en: {
    pageTitle: "Create Your Course",
    pageDescription: "Give your course an engaging name. You can always change it later.",
    titleLabel: "Course Title",
    titlePlaceholder: "e.g., 'Advanced Skills Training'",
    titleDescription: "Describe what you'll cover in this course.",
    cancelButton: "Cancel",
    continueButton: "Continue",
    successMessage: "Course created",
    errorMessage: "Something went wrong",
  },
  es: {
    pageTitle: "Crea tu Curso",
    pageDescription: "Dale un nombre atractivo a tu curso. Puedes cambiarlo más tarde.",
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
    message: "Title is required",
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const language = "es"; // Change to "en" for English

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ""
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-secondary/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pencil className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                {textContent[language].pageTitle}
              </h1>
            </div>
            <p className="text-muted-foreground">
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
                    <FormLabel className="text-base font-semibold">
                      {textContent[language].titleLabel}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder={textContent[language].titlePlaceholder}
                        {...field}
                        className="h-12 text-lg"
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
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
              className="w-32"
            >
              {textContent[language].cancelButton}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="w-32"
          >
            {textContent[language].continueButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePage;