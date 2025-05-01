"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourse } from "./hook/useCourse";
import { sanitizeHtml } from "./utils/courseUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ChapterItem from "./components/ChapterItem";
import Header from "./components/Header";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Star,
  PlayCircle,
  Download,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PaymentButton from "@/app/payments/PaymentButton";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import type { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const { course, relatedCourses, chaptersPreview, isLoading } =
    useCourse(courseId);

  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});
  const [user, setUser] = useState<UserDB | null>(null);
  const [userVerified, setUserVerified] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const currentUser = await getCurrentUserFromDB();
      if (!currentUser || currentUser.isDeleted || currentUser.isBanned) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setUserVerified(true);
      }
    };

    validateSession();
  }, [router]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!userVerified || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50 p-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center bg-gray-50">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-2xl font-bold">Curso no encontrado</h1>
        <p className="text-gray-500 mb-4">
          El curso que buscas no está disponible o ha sido eliminado.
        </p>
        <Button
          onClick={() => router.push("/courses")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Ver todos los cursos
        </Button>
      </div>
    );
  }

  const { title, description, imageUrl, price, category, purchases } = course;
  const isFree = !price || price === 0;
  const priceDisplay = isFree ? "Gratis" : `${price.toFixed(2)}$`;
  const students = purchases?.length ?? 0;
  const learningObjectives = course.data?.learningObjectives || [];

  const rating = 4.8;
  const chapterCount = chaptersPreview.length;
  const totalHours = chapterCount * 0.5;
  const updatedDate = new Date(course.updatedAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2">
              <span className="inline-block bg-emerald-800 bg-opacity-50 rounded-full px-3 py-1 text-sm font-medium">
                {category?.name || "Sin categoría"}
              </span>
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(rating) ? "currentColor" : "none"}
                  />
                ))}
                <span className="ml-1 text-white">{rating}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-emerald-800 bg-opacity-40 p-2 rounded-lg">
                <PlayCircle size={18} /> {chapterCount} lecciones
              </div>
              <div className="flex items-center gap-2 bg-emerald-800 bg-opacity-40 p-2 rounded-lg">
                <Clock size={18} /> {totalHours} horas
              </div>
              <div className="flex items-center gap-2 bg-emerald-800 bg-opacity-40 p-2 rounded-lg">
                <Users size={18} /> {students}{" "}
                {students === 1 ? "alumno" : "alumnos"}
              </div>
              <div className="flex items-center gap-2 bg-emerald-800 bg-opacity-40 p-2 rounded-lg">
                <Calendar size={18} /> Actualizado {updatedDate}
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 h-64 rounded-xl overflow-hidden relative shadow-2xl">
            {imageUrl ? (
              <Image
                width={400}
                height={400}
                src={imageUrl}
                alt={title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-800 to-teal-900">
                <BookOpen size={64} className="text-emerald-200" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center cursor-pointer">
                <PlayCircle size={32} className="text-emerald-700" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* Left Section */}
        <section className="md:col-span-2 space-y-8">
          {learningObjectives.length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Award size={28} className="text-emerald-600" /> Lo que
                aprenderás
              </h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {learningObjectives.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-emerald-600 mt-1 flex-shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <BookOpen size={28} className="text-emerald-600" /> Descripción
              del curso
            </h2>
            <div className="mt-6 prose max-w-none text-gray-700">
              {description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(description),
                  }}
                />
              ) : (
                <p className="flex items-center gap-2 text-gray-500 p-4 bg-gray-50 rounded-lg">
                  <AlertCircle size={18} /> No hay descripción disponible.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <BookOpen size={28} className="text-emerald-600" /> Contenido
                del curso
              </h2>
              <div className="text-sm text-gray-600">
                {chapterCount} lecciones • {totalHours} horas
              </div>
            </div>

            <div className="space-y-4">
              {chaptersPreview.length ? (
                chaptersPreview.map((chapter, index) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    onToggle={() => toggleChapter(chapter.id)}
                  />
                ))
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <AlertCircle
                    size={32}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p className="text-gray-500">No hay capítulos disponibles.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Section */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {priceDisplay}
              </div>
            </div>

            <div className="space-y-3">
              <PaymentButton
                amount={price || 0}
                description={title}
                courseId={courseId}
                isFree={isFree}
              />
              <Button
                variant="outline"
                className="w-full py-3 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Compartir curso
              </Button>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-6 space-y-3">
              <h4 className="font-medium text-gray-800">Este curso incluye:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <PlayCircle size={18} className="text-emerald-600" /> Acceso
                  completo
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Download size={18} className="text-emerald-600" /> Materiales
                  descargables
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Award size={18} className="text-emerald-600" /> Certificado
                  al completar
                </li>
              </ul>
            </div>
          </div>

          {relatedCourses.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Cursos relacionados
              </h3>
              <ul className="space-y-4">
                {relatedCourses.map((rel) => (
                  <li
                    key={rel.id}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <Link
                      href={`/courses/${rel.id}`}
                      className="hover:text-emerald-700 text-gray-700 flex items-center gap-2 group"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:w-3 transition-all"></div>
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button
                variant="link"
                className="w-full mt-4 text-emerald-600 hover:text-emerald-700"
              >
                Ver todos los cursos
              </Button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
