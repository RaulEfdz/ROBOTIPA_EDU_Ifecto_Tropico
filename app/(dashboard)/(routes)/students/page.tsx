"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { guestRoutes, teacherRoutes } from '../../_components/SidebarRoutes';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

type StudentNavigationProps = {
    isSuperAdmin?: boolean;
  };
  
  const StudentNavigation =() =>{


  return (
    <div className={cn(
      "h-full w-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden"
    )}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.2] -z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/20" />
      
      <div className="container mx-auto py-8 px-4 pt-16 relative">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center space-y-4 mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Herramientas para Estudiantes
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Accede a todas las herramientas necesarias para gestionar tus cursos.
          </p>
        </motion.div>

        <div className="flex items-center justify-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-6xl"
          >
            {guestRoutes.map((route, index) => {
              const IconComponent = route.icon;
              const showBadge = route.badge?.viewLabel && new Date() < new Date(route?.badge?.until !== undefined ? route?.badge?.until : 0);

              return (
                <motion.div
                  key={route.href}
                  variants={item}
                  whileHover={hoverEffect}
                  className="group"
                >
                  <Link href={route.href}>
                    <Card className="relative h-full overflow-hidden border-0 bg-[#FFFCF8]/10 backdrop-blur-lg hover:bg-[#FFFCF8]/20 transition-all duration-300 rounded-xl shadow-xl">
                      {/* Card background effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] to-white/[0.05] rounded-xl" />
                      <motion.div
                        className="absolute inset-0 bg-[#FFFCF8]/5 rounded-xl transform rotate-2 -z-10"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      />

                      <CardContent className="flex flex-col items-center p-8 space-y-6 relative z-10">
                        <motion.div
                          className="p-4 text-white bg-[#FFFCF8]/20 rounded-full group-hover:bg-[#FFFCF8]/30 
                                   transition-all duration-300 shadow-lg"
                          whileHover={{ rotate: 5, scale: 1.1 }}
                        >
                          <IconComponent/>
                        </motion.div>

                        <h3 className="text-xl font-semibold text-white text-center">
                          {route.label}
                        </h3>

                        {showBadge && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-4 right-4 px-3 py-1 bg-[#FFFCF8]/20 
                                     rounded-full text-sm text-white border border-white/20
                                     shadow-lg backdrop-blur-sm"
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
}
export default StudentNavigation