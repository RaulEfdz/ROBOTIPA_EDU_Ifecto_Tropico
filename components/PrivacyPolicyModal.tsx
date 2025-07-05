"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";

interface PrivacyPolicyModalProps {
  trigger?: React.ReactNode;
  triggerText?: string;
  triggerClassName?: string;
  showIcon?: boolean;
}

export default function PrivacyPolicyModal({ 
  trigger, 
  triggerText = "Políticas de Privacidad",
  triggerClassName = "",
  showIcon = false 
}: PrivacyPolicyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      className={`text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ${triggerClassName}`}
    >
      {showIcon && <ShieldCheck className="w-4 h-4 mr-2" />}
      {triggerText}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 mb-4">
            Políticas de Privacidad
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Recopilación de Información</h3>
            <p className="mb-3">
              Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, 
              completa su perfil, o se comunica con nosotros. Esta información puede incluir:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Información personal (nombre, email, teléfono)</li>
              <li>Información educativa (universidad, nivel educativo, especialización)</li>
              <li>Preferencias de aprendizaje y comunicación</li>
              <li>Datos de progreso en cursos y actividades</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Uso de la Información</h3>
            <p className="mb-3">Utilizamos su información para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Proporcionar y mejorar nuestros servicios educativos</li>
              <li>Personalizar su experiencia de aprendizaje</li>
              <li>Comunicarnos con usted sobre cursos y actualizaciones</li>
              <li>Analizar el uso de la plataforma para mejoras</li>
              <li>Cumplir con obligaciones legales y de seguridad</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Compartir Información</h3>
            <p className="mb-3">
              No vendemos, intercambiamos o transferimos su información personal a terceros sin su 
              consentimiento, excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
              <li>Cuando sea requerido por ley o autoridades competentes</li>
              <li>Para proteger nuestros derechos, propiedad o seguridad</li>
              <li>Con su consentimiento explícito</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Seguridad de Datos</h3>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
              su información personal contra acceso no autorizado, alteración, divulgación o destrucción. 
              Esto incluye encriptación de datos, acceso restringido y monitoreo de seguridad continuo.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Sus Derechos</h3>
            <p className="mb-3">Usted tiene derecho a:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Acceder a su información personal</li>
              <li>Rectificar datos inexactos o incompletos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Limitar el procesamiento de su información</li>
              <li>Portar sus datos a otra plataforma</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Cookies y Tecnologías Similares</h3>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso 
              de la plataforma y proporcionar funcionalidades personalizadas. Puede gestionar sus 
              preferencias de cookies a través de la configuración de su navegador.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Retención de Datos</h3>
            <p>
              Conservamos su información personal solo durante el tiempo necesario para cumplir con 
              los propósitos descritos en esta política, a menos que la ley requiera o permita un 
              período de retención más largo.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Cambios en la Política</h3>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre 
              cambios significativos mediante un aviso prominente en nuestra plataforma o por email.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Contacto</h3>
            <p>
              Si tiene preguntas sobre esta política de privacidad o sobre el manejo de su información 
              personal, puede contactarnos a través de los canales oficiales de soporte de la plataforma.
            </p>
          </section>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-emerald-800">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}