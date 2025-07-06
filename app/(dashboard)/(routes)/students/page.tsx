"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { guestRoutes } from "../../_components/routes";
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
};
const hoverEffect = {
  scale: 1.02,
  y: -3,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 15,
  },
};
const StudentNavigation = () => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden flex flex-col items-center justify-center px-4"
      )}
    >
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-grid-slate-200/30 -z-[1]" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center space-y-3 mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          Herramientas para Estudiantes
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Accede a todas las herramientas necesarias para gestionar tus cursos.
        </p>
      </motion.div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl justify-items-center"
      >
        {guestRoutes.map((route) => {
          const IconComponent = route.icon;
          const showBadge =
            route.badge?.viewLabel &&
            new Date() < new Date(route?.badge?.until ?? 0);
          return (
            <motion.div
              key={route.href}
              variants={item}
              whileHover={hoverEffect}
              className="group"
            >
              {route.href && (
                <Link href={route.href}>
                  <Card className="relative w-72 overflow-hidden border bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-4 min-h-[150px]">
                      <motion.div
                        className="p-3 text-primary-600 bg-primary-50 rounded-full group-hover:bg-primary-100 transition-all duration-300"
                        whileHover={{ rotate: 3, scale: 1.05 }}
                      >
                        <IconComponent />
                      </motion.div>
                      <h3 className="text-base font-semibold text-center text-slate-800">
                        {route.label}
                      </h3>
                      {showBadge && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-3 right-3 px-2 py-0.5 bg-amber-50 rounded-full text-[10px] font-medium text-amber-700 border border-amber-200"
                        >
                          {route?.badge?.textLabel}
                        </motion.span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
export default StudentNavigation;
