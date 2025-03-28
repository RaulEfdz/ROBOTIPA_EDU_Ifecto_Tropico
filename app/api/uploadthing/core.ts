import { createUploadthing, type FileRouter } from "uploadthing/next";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

const f = createUploadthing();

// Autenticación utilizando Clerk y verificación adicional
const handleAuth = async (req: Request) => {
  const user = (await getUserDataServer())?.user;
  
    if (!user?.id) {
    throw new Error("Unauthorized: No user ID found");
  }

  const isAuthorized = isTeacher(user?.id);
  if (!isAuthorized) {
    throw new Error("Forbidden: User is not authorized");
  }

  return { userId: user?.id };
};

// Configuración de rutas de archivos
export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {

    }),

  courseAttachment: f({
    text: { maxFileSize: "2MB" },
    image: { maxFileSize: "16MB" },
    "application/vnd.ms-powerpoint": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "16MB" },
    "application/vnd.ms-excel": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
    audio: { maxFileSize: "16MB" },
    pdf: { maxFileSize: "16MB" },
    "application/json": { maxFileSize: "16MB" }
  })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {

    }),

  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const { userId } = await handleAuth(req);
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {

    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
