"use client"
import React, { useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Chapter } from '@prisma/client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Preview } from '@/components/preview';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { fetchData } from '../../../../custom/fetchData';

const texts = {
  es: {
    title: 'Descripción de capítulo',
    editButton: 'Editar descripción',
    cancelButton: 'Cancelar',
    saveButton: 'Guardar',
    placeholder: 'Sin descripción',
    successMessage: 'Capítulo actualizado',
    errorMessage: 'Ocurrió un error',
  },
  en: {
    title: 'Chapter Description',
    editButton: 'Edit Description',
    cancelButton: 'Cancel',
    saveButton: 'Save',
    placeholder: 'No description',
    successMessage: 'Chapter updated',
    errorMessage: 'An error occurred',
  },
};

interface ChapterDescriptionFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  lang?: 'es' | 'en';
}

const formSchema = z.object({
  description: z.string().min(1),
});

export const ChapterDescriptionForm = ({
  initialData,
  courseId,
  chapterId,
  lang = 'es',
}: ChapterDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/chapters/${chapterId}/edit`;

    const callback = () => {
      toast.success(texts[lang].successMessage);
      toggleEdit();
      router.refresh();
    };

    try {
      await fetchData({ values, courseId, path, callback, method: 'PUT' });
    } catch (error) {
      toast.error(texts[lang].errorMessage);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 overflow-y-auto max-h-[40vh]">
      {/* <div className="font-medium flex items-center justify-between bg-gray-900 text-white px-2 rounded-t-md ">
        {form.watch('description') ? (
          <Check className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <X className="h-5 w-5 text-red-500 mr-2" />
        )}
        <label className="font-bold mr-3">{texts[lang].title}</label>
        <Dialog open={isEditing} onOpenChange={toggleEdit} >

          <DialogTrigger asChild>
            <Button variant="ghost" className="text-gray-100 ">
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </Button>
          </DialogTrigger>

          <DialogContent className="min-w-[90vw] h-[80vh] m-3">
            <DialogHeader>
              <DialogTitle>{texts[lang].title}</DialogTitle>
              <DialogDescription>
                {texts[lang].placeholder}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem   className="h-[65vh] max-h-[65vh] overflow-y-auto bg-gray-200 text-black"
>
                      <FormControl>
                        <Editor {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-2">
                  <Button
                    disabled={!isValid || isSubmitting}
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {texts[lang].saveButton}
                  </Button>
                 
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {!isEditing && (
        <div
          className={cn(
            'text-sm mt-2 p-4',
            !initialData.description && 'italic text-gray-500'
          )}
        >
          {!initialData.description && texts[lang].placeholder}
          {initialData.description && <Preview value={initialData.description} />}
        </div>
      )} */}
    </div>
  );
};