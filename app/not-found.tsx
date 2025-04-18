"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/utils/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primaryCustom2 to-primaryCustom2 flex flex-col items-center justify-center p-4">
      <div className="relative bg-[#FFFCF8]/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center space-y-8 max-w-2xl mx-auto">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[#FFFCF8]/5 rounded-2xl transform rotate-2 -z-10" />
        <div className="absolute inset-0 bg-[#FFFCF8]/5 rounded-2xl transform -rotate-2 -z-10" />
        
        {/* Icon with animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <XCircle className="w-24 h-24 mx-auto text-TextCustom/90 drop-shadow-lg" />
        </motion.div>
        
        {/* Error Number with animation */}
        <motion.h1 
          className="text-8xl font-bold text-TextCustom drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          404
        </motion.h1>
        
        {/* Title with animation */}
        <motion.h2 
          className="text-3xl font-semibold text-TextCustom/90"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ¡Página no encontrada!
        </motion.h2>
        
        {/* Description with animation */}
        <motion.p 
          className="text-xl text-TextCustom/80"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Por favor, verifica la URL o regresa al inicio.
        </motion.p>
        
        {/* Logo with animation */}
        <motion.div 
          className="text-2xl font-bold text-TextCustom flex justify-center py-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Logo height={200} width={200} version='light' />
        </motion.div>
        
        {/* Action Buttons with animation */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <Button 
              size="lg"
              className="min-w-[200px] bg-[#FFFCF8]/20 hover:bg-[#FFFCF8]/30 backdrop-blur-sm transition-all duration-300 flex items-center gap-2 text-TextCustom border border-TextCustom/20"
            >
              <Home className="w-4 h-4" />
              Regresar al inicio
            </Button>
          </Link>
          
          <Button 
            size="lg"
            onClick={() => window.history.back()}
            className="min-w-[200px] bg-[#FFFCF8]/20 hover:bg-[#FFFCF8]/30 backdrop-blur-sm transition-all duration-300 flex items-center gap-2 text-TextCustom border border-TextCustom/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Página anterior
          </Button>
        </motion.div>
      </div>
    </div>
  );
}