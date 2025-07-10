// components/StudentNavigation.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { teacherRoutes } from "@/app/(dashboard)/_components/routes";

// Motion variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 12 },
  },
};

const hoverEffect = {
  scale: 1.02,
  y: -3,
  transition: { type: "spring", stiffness: 300, damping: 15 },
};

// Define the route types
interface Badge {
  viewLabel: boolean;
  until: string;
  textLabel: string;
}

interface SubRoute {
  href: string;
  label: string;
  icon: React.FC;
  badge?: Badge;
}

interface RouteGroup {
  label: string;
  subRoutes: SubRoute[];
}

// Import teacherRoutes from the appropriate module

const StudentNavigation: React.FC = () => {
  const userGroup = teacherRoutes.find((r) => r.label === "Usuarios");
  const subRoutes = userGroup?.subRoutes ?? [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid-slate-200/30 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center mb-10 space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          Gestión de Usuarios
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Accede a las diferentes secciones de usuarios.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl justify-items-center"
      >
        {subRoutes.map((sub) => {
          const IconComponent = sub.icon;
          const showBadge =
            sub.badge?.viewLabel &&
            sub.badge.until &&
            new Date() < new Date(sub.badge.until);

          return (
            <motion.div
              key={sub.href}
              variants={item}
              whileHover={hoverEffect}
              className="group"
            >
              <Link href={sub.href} passHref>
                <Card className="relative w-72 border shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-4 min-h-[150px]">
                    <motion.div
                      className="p-3 rounded-full group-hover:bg-primary-100 transition-all duration-300"
                      whileHover={{ rotate: 3, scale: 1.05 }}
                    >
                      <IconComponent />
                    </motion.div>

                    <h3 className="text-primary-600 font-semibold text-center">
                      {sub.label}
                    </h3>

                    {showBadge && (
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 right-3 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-700 border border-amber-200"
                      >
                        {sub.badge?.textLabel}
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
  );
};

export default StudentNavigation;
