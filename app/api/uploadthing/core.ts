// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { isTeacher_server } from "@/app/(dashboard)/(routes)/admin/teacher_server";

const f = createUploadthing();

// Middleware de autenticación
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

// Rutas configuradas para archivos
export const ourFileRouter = {
  // Subida de imágenes para cursos
  courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Imagen subida:", file.url);
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
      console.log("✅ Archivo adjunto subido:", file.url);
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
      console.log("📄 Archivo del editor subido:", file.url);
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
      console.log("🎥 Video único subido:", file.url);
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
      console.log("🎬 Video múltiple subido:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
