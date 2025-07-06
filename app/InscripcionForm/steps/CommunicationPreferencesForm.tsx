// Step3.js
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const CommunicationPreferencesForm = ({ form }: any) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Paso 3: Preferencias de Comunicación y Consentimientos
      </h3>

      <FormField
        control={form.control}
        name="preferenciasComunicacion"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">
              Preferencias de Comunicación
            </FormLabel>
            {["Email", "WhatsApp"].map((medio) => (
              <FormField
                key={medio}
                control={form.control}
                name="preferenciasComunicacion"
                render={({ field }) => {
                  const checked = field.value.includes(medio);
                  return (
                    <FormItem key={medio} className="flex flex-row space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(checked) => {
                            if (checked)
                              field.onChange([...field.value, medio]);
                            else
                              field.onChange(
                                field.value.filter((m: string) => m !== medio)
                              );
                          }}
                        />
                      </FormControl>
                      <FormLabel>{medio}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />

      <h2>Términos y condiciones</h2>

      <FormField
        control={form.control}
        name="aceptaTerminos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id="aceptaTerminosCheckbox"
              />
            </FormControl>
            <div className="flex flex-col">
              <FormLabel htmlFor="aceptaTerminosCheckbox">
                Acepto los{" "}
                <a
                  href="/terminos-y-condiciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline hover:text-primary-700"
                >
                  términos y condiciones
                </a>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default CommunicationPreferencesForm;
