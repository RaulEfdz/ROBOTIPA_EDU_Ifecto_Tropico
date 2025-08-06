"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import EditorText from "@/components/EditorText/EditorText"
import { Upload } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  content: z.string().min(1, "El contenido es requerido"),
  type: z.enum(["document", "procedure", "guideline", "policy"]),
  courseId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().default(false)
})

interface CreateProtocolModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  courses: Array<{ id: string; title: string }>
  categories: Array<{ id: string; name: string }>
}

export function CreateProtocolModal({
  isOpen,
  onClose,
  onSuccess,
  courses,
  categories
}: CreateProtocolModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      type: "document",
      courseId: "",
      categoryId: "",
      tags: "",
      isPublic: false
    }
  })

  const protocolTypes = [
    { value: "document", label: "Documento" },
    { value: "procedure", label: "Procedimiento" },
    { value: "guideline", label: "Guía" },
    { value: "policy", label: "Política" }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Archivo no válido",
          description: "Solo se permiten archivos PDF, DOC, DOCX y TXT",
          variant: "destructive"
        })
        return
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no puede ser mayor a 5MB",
          variant: "destructive"
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post("/api/uploadthing", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      return response.data
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Error al subir el archivo")
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      let fileData = null
      if (selectedFile) {
        fileData = await uploadFile(selectedFile)
      }

      const protocolData = {
        ...values,
        courseId: values.courseId || null,
        categoryId: values.categoryId || null,
        tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
        ...(fileData && {
          fileUrl: fileData.url,
          fileName: selectedFile?.name,
          fileSize: selectedFile?.size
        })
      }

      await axios.post("/api/protocols", protocolData)

      toast({
        title: "Protocolo creado",
        description: "El protocolo ha sido creado exitosamente"
      })

      form.reset()
      setSelectedFile(null)
      onSuccess()

    } catch (error) {
      console.error("Error creating protocol:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el protocolo",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Protocolo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del protocolo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {protocolTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción del protocolo"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin curso</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin categoría</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Separar con comas (ej: urgente, política, seguridad)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Archivo adjunto */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo adjunto (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Hacer clic para subir archivo"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT (máx. 5MB)
                  </span>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido *</FormLabel>
                  <FormControl>
                    <div className="min-h-[300px]">
                      <EditorText
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Escribe el contenido del protocolo aquí..."
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Protocolo público</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Permite que todos los usuarios puedan ver este protocolo
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Protocolo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}