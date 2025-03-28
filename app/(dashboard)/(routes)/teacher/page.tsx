"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { teacherRoutes } from '../../_components/SidebarRoutes';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Paleta de colores de la marca
const brandPrimary = "#FFFCF8"; // Fondo de tarjetas
const brandSecondaryDark = "#47724B"; // Color principal para textos y detalles
const brandSecondary = "#ACBC64"; // Acento en iconos y textos secundarios
const brandTertiaryDark = "#386329"; // Titulares y estados activos
const brandTertiary = "#C8E065"; // Toques de resalte

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const hoverEffect = {
  scale: 1.03,
  y: -5,
  transition: { 
    type: "spring",
    stiffness: 400,
    damping: 10
  }
};

type TeacherNavigationProps = {
  isSuperAdmin?: boolean;
};

const TeacherNavigation = () => {
  // const filteredRoutes = teacherRoutes.filter(route =>
  //   !route.superAdmin || (route.superAdmin && isSuperAdmin)
  // );

  return (
    <div
      className={cn("h-full w-full relative overflow-hidden")}
      style={{
        background: `linear-gradient(to bottom right, ${brandSecondary}, ${brandTertiary})`
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-grid-white/[0.2] -z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/20" />

      <div className="container mx-auto py-8 px-4 pt-16 relative">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center space-y-4 mb-16"
        >
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ color: brandTertiaryDark }}
          >
            Herramientas para Profesores
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: `${brandSecondaryDark}CC` }} // CC es el 80% de opacidad
          >
            Accede a todas las herramientas necesarias para gestionar tus cursos y estudiantes
          </p>
        </motion.div>

        <div className="flex items-center justify-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-6xl"
          >
            {teacherRoutes.map((route) => {
              const IconComponent = route.icon;
              const showBadge =
                route.badge?.viewLabel &&
                new Date() <
                  new Date(
                    route?.badge?.until !== undefined ? route?.badge?.until : 0
                  );

              return (
                <motion.div
                  key={route.href}
                  variants={item}
                  whileHover={hoverEffect}
                  className="group"
                >
                  <Link href={route.href}>
                    <Card className="relative h-full overflow-hidden border-0 bg-[rgba(255,252,248,0.1)] backdrop-blur-lg hover:bg-[rgba(255,252,248,0.2)] transition-all duration-300 rounded-xl shadow-xl">
                      {/* Efectos de fondo de la tarjeta */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,252,248,0.15)] to-[rgba(255,252,248,0.05)] rounded-xl" />
                      <motion.div
                        className="absolute inset-0 bg-[rgba(255,252,248,0.05)] rounded-xl transform rotate-2 -z-10"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      />

                      <CardContent className="flex flex-col items-center p-8 space-y-6 relative z-10">
                        <motion.div
                          className="p-4 rounded-full transition-all duration-300 shadow-lg bg-[rgba(255,252,248,0.2)] group-hover:bg-[rgba(255,252,248,0.3)]"
                          style={{ color: brandSecondary }}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                        >
                          <IconComponent />
                        </motion.div>

                        <h3
                          className="text-xl font-semibold text-center"
                          style={{ color: brandTertiaryDark }}
                        >
                          {route.label}
                        </h3>

                        {showBadge && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm border shadow-lg backdrop-blur-sm"
                            style={{
                              backgroundColor: "rgba(255,252,248,0.2)",
                              color: brandSecondaryDark,
                              borderColor: `${brandSecondaryDark}33`
                            }}
                          >
                            {route?.badge?.textLabel}
                          </motion.span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavigation;
