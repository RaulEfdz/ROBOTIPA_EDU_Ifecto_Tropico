// components/CourseHeader.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { Course } from "@/prisma/types";
import { formatDate, formatRelative } from "../utils/courseUtils";

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Course Image */}
          <div className="md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  Sin imagen disponible
                </div>
              )}
            </div>
          </div>

          {/* Right: Course Info */}
          <div className="md:w-1/2 space-y-6">
            {course.category && (
              <Badge className="bg-emerald-100 text-emerald-700">
                {course.category.name}
              </Badge>
            )}

            <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-1" />
              <span>
                Creado: {formatDate(course.createdAt)} | Actualizado:{" "}
                {formatRelative(course.updatedAt)}
              </span>
            </div>

            <div className="pt-4 space-y-4">
              <div className="text-3xl font-bold text-emerald-600">
                {course.price ? formatCurrency(course.price) : "Gratis"}
              </div>
              <p className="text-sm text-gray-600">
                Ya se han inscrito {course.purchases?.length || 0}{" "}
                {course.purchases?.length === 1 ? "alumno" : "alumnos"}
              </p>
              <Button
                asChild
                size="lg"
                className="w-full py-6"
                disabled={!course.isPublished}
              >
                <Link href={`/checkout/${course.id}`}>
                  {course.price ? "Comprar ahora" : "Inscribirse gratis"}
                </Link>
              </Button>
              {!course.isPublished && (
                <p className="text-amber-600 text-sm text-center">
                  Este curso aún no está disponible para inscripción
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
