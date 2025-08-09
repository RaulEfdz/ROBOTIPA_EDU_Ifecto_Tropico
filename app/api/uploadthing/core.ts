// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { isTeacher_server } from "@/app/(dashboard)/(routes)/admin/teacher_server";

const f = createUploadthing();

// Middleware de autenticación para profesores
const handleAuth = async (req: Request) => {
  const user = await getCurrentUserFromDBServer();

  if (!user?.id) {
    throw new Error("Unauthorized: No user ID found");
  }

  const isAuthorized = await isTeacher_server(user.id);
  if (!isAuthorized) {
    throw new Error("Forbidden: User is not authorized");
  }

  return { userId: user.id };
};

// Middleware de autenticación para cualquier usuario (validación documentos)
const handleUserAuth = async (req: Request) => {
  const user = await getCurrentUserFromDBServer();

  if (!user?.id) {
    throw new Error("Unauthorized: No user ID found");
  }

  return { userId: user.id, userEmail: user.email, userName: user.fullName };
};

// Rutas configuradas para archivos
export const ourFileRouter = {
  // Subida de imágenes para cursos
  courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Course image upload completed:', file.url);
      // No devolver nada, onUploadComplete debe retornar void
    }),

  // Subida de archivos adjuntos para cursos
  courseAttachment: f({
    text: { maxFileSize: "2MB" },
    image: { maxFileSize: "16MB" },
    pdf: { maxFileSize: "16MB" },
    audio: { maxFileSize: "16MB" },
    "application/json": { maxFileSize: "16MB" },
    "application/vnd.ms-powerpoint": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "16MB" },
    "application/vnd.ms-excel": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Course attachment upload completed:', file.url);
      // No devolver nada, onUploadComplete debe retornar void
    }),

  // Subida de archivos desde el editor
  editorFileUpload: f({
    "application/pdf": { maxFileSize: "16MB" },
    "application/vnd.ms-powerpoint": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "16MB" },
    "application/vnd.ms-excel": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Editor file upload completed:', file.url);
      // No devolver nada, onUploadComplete debe retornar void
    }),

  // Subida de un único video por capítulo
  chapterVideo: f({
    video: {
      maxFileSize: "1GB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Chapter video upload completed:', file.url);
      // No devolver nada, onUploadComplete debe retornar void
    }),

  // Subida de múltiples videos por capítulo (opcional)
  chapterVideoUpload: f({
    video: {
      maxFileSize: "1GB",
      maxFileCount: 3, // Puedes ajustar el límite
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Chapter video upload completed (multiple):', file.url);
      // No devolver nada, onUploadComplete debe retornar void
    }),

  // Subida de documentos PDF para validación
  documentValidation: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 }
  })
    .middleware(async ({ req }) => {
      const { userId, userEmail, userName } = await handleUserAuth(req);
      return { userId, userEmail, userName };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Document validation upload completed:', {
        userId: metadata.userId,
        userEmail: metadata.userEmail,
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size
      });
      // El procesamiento del documento se hará en la API de validación
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
