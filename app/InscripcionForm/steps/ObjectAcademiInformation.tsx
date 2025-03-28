// Step2.js
import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const ObjectAcademiInformation = ({ form }:any) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Paso 2: Información Académica y Objetivos</h3>

      <FormField
        control={form.control}
        name="universidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Universidad</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nivelEstudio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel de Estudio</FormLabel>
            <FormControl>
              <select className="border p-2 w-full" {...field}>
                <option value="">--Seleccionar--</option>
                <option value="pregrado">Pregrado</option>
                <option value="maestria">Maestría</option>
                <option value="doctorado">Doctorado</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="carrera"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carrera</FormLabel>
            <FormControl>
              <select className="border p-2 w-full" {...field}>
                <option value="">--Seleccionar--</option>
                <option value="medicina">Medicina</option>
                <option value="enfermeria">Enfermería</option>
                <option value="saludPublica">Salud Pública</option>
                <option value="otra">Otra</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="areaEspecializacion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área de Especialización</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="objetivosAprendizaje"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">Objetivos de Aprendizaje</FormLabel>
            {["Mejorar habilidades de investigación", "Networking profesional", "Competencias en ética clínica"].map(
              (obj) => (
                <FormField
                  key={obj}
                  control={form.control}
                  name="objetivosAprendizaje"
                  render={({ field }) => {
                    const checked = field.value.includes(obj);
                    return (
                      <FormItem
                        key={obj}
                        className="flex flex-row space-x-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(checked) => {
                              if (checked)
                                field.onChange([...field.value, obj]);
                              else
                                field.onChange(
                                  field.value.filter((o: string) => o !== obj)
                                );
                            }}
                          />
                        </FormControl>
                        <FormLabel>{obj}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              )
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ObjectAcademiInformation;