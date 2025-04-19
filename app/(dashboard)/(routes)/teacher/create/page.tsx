'use client';

import React, { useState, useMemo } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, FileText, GraduationCap } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { texts, defaultLanguage, Language, TFunction } from './locales/course-create';
import { useConfettiStore } from '@/hooks/use-confetti-store';

const CreateCoursePage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language] = useState<Language>(defaultLanguage);
  const confetti = useConfettiStore();

  // Translation function
  const t: TFunction = useMemo(
    () => (key) => texts[key]?.[language] ?? texts[key]?.[defaultLanguage] ?? key,
    [language]
  );

  const formSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .min(3, { message: t('validationTitleRequired') })
          .max(60, { message: t('validationTitleTooLong') }),
      }),
    [t]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
    mode: 'onChange',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error creating course');
      }
      const data = await response.json();
      toast.success(t('successMessage'), {
        description: t('successDescription'),
      });
      confetti.onOpen();
      router.push(`/teacher/courses/${data.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(t('errorMessage'), {
        description: t('errorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label={t('backButton')}
              className="rounded-full hover:bg-green-50"
            >
              <ArrowLeft className="h-5 w-5 text-green-700" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">
              {t('pageTitle')}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 rounded-lg">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="font-medium text-green-800">{t('pageDescription')}</h2>
              <p className="text-sm text-green-700/80 mt-1">
                {t('pageSubDescription') ||
                  'Get started by naming your course. You can change this later.'}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('titleLabel')}
                    </FormLabel>
                    <FormDescription>
                      {t('titleDescription') ||
                        'Choose a clear, descriptive title for your course.'}
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('titlePlaceholder')}
                        className="h-12 text-base focus-visible:ring-green-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between px-0 pt-6 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-300"
                >
                  {t('cancelButton')}
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isSubmitting
                    ? t('submittingButton') || 'Creating...'
                    : t('continueButton')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
