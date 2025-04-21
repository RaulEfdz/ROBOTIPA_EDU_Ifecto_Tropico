// components/TeacherNavigation.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { teacherRoutes } from "../../_components/routes";

// Motion variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const hoverEffect = {
  scale: 1.02,
  y: -4,
  transition: { type: "spring", stiffness: 300, damping: 12 },
};

const TeacherNavigation: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-grid-slate-300/20 -z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center space-y-4 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          Herramientas para Profesores
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-slate-600">
          Accede a todas las herramientas necesarias para gestionar tus cursos y
          estudiantes.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl justify-items-center"
      >
        {teacherRoutes.map((route) => {
          const IconComponent = route.icon;
          const badge = route.badge;
          // Solo mostramos badge si está definido, es visible y no ha expirado
          const showBadge =
            badge?.viewLabel &&
            badge.until &&
            new Date() < new Date(badge.until);

          return (
            <motion.div
              key={route.href}
              variants={item}
              whileHover={hoverEffect}
              className="group cursor-pointer"
              onClick={() => router.push(route.href || "/")}
            >
              <Card className="relative w-72 overflow-hidden border bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center p-4 gap-3 relative z-10 min-h-[150px]">
                  <motion.div
                    className="p-3 bg-stone-100 rounded-full group-hover:bg-stone-200 text-stone-600 transition-all"
                    whileHover={{ rotate: 3, scale: 1.05 }}
                  >
                    <IconComponent />
                  </motion.div>

                  <h3 className="text-base font-semibold text-center text-slate-800">
                    {route.label}
                  </h3>

                  {showBadge && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium border border-stone-300 bg-stone-100 text-stone-700 shadow"
                    >
                      {badge.textLabel}
                    </motion.span>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default TeacherNavigation;
