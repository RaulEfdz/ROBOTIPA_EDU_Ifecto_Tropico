"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../(dashboard)/_components/sidebar";
import { UserProfile } from "@/prisma/types";
import { getCurrentUser } from "../(auth)/handler/getCurrentUser";
import toast from "react-hot-toast";

const EXCLUDED_KEYS = ["id", "deviceType", "role", "createdAt", "updatedAt", "avatar"]; // Lista de claves a excluir

const FIELD_LABELS: { [key: string]: string } = {
  acceptsTerms: "Acepta los Términos",
  age: "Edad",
  available: "Disponible",
  communicationPreferences: "Preferencias de Comunicación",
  countryOfResidence: "País de Residencia",
  delete: "Eliminar",
  educationLevel: "Nivel Educativo",
  emailAddress: "Correo Electrónico",
  fullName: "Nombre Completo",
  gender: "Género",
  isAdminVerified: "Verificación de Administrador",
  isEmailVerified: "Correo Verificado",
  learningObjectives: "Objetivos de Aprendizaje",
  major: "Carrera Principal",
  otherMajor: "Otra Carrera",
  otherObjective: "Otro Objetivo",
  phoneNumber: "Número de Teléfono",
  specializationArea: "Área de Especialización",
  university: "Universidad",
};

// Opciones para campos select
const FIELD_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  gender: [
    { value: "male", label: "Masculino" },
    { value: "female", label: "Femenino" },
    { value: "other", label: "Otro" },
  ],
  educationLevel: [
    { value: "highschool", label: "Secundaria" },
    { value: "bachelor", label: "Licenciatura" },
    { value: "master", label: "Maestría" },
    { value: "phd", label: "Doctorado" },
    { value: "ingenieria", label: "Ingenieria" },
  ],
  countryOfResidence: [
    { value: "panama", label: "Panamá" },
    { value: "colombia", label: "Colombia" },
    { value: "mexico", label: "México" },
    { value: "usa", label: "Estados Unidos" },
    { value: "otro", label: "otro" },
  ],
};

const ProfilePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [originalData, setOriginalData] = useState<UserProfile | null>(null); // Mantiene todos los datos originales
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getCurrentUser();
        if (!result.success) {
          toast.error("Error al obtener los datos del usuario");
          return;
        }
        setUserData(result.dbUser); // Guarda todos los datos en `userData`
        setOriginalData(result.dbUser); // Guarda una copia para asegurarte de que nada se pierda
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        toast.error("Error inesperado al obtener datos del usuario");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : undefined;

    setUserData((prev) =>
      prev
        ? {
            ...prev,
            [name]: isCheckbox ? checked : value,
          }
        : null
    );
  };

  const handleSave = async () => {
    if (!userData || !originalData) return;
    setIsLoading(true);
    try {
      // Combina los datos actualizados con los datos originales
      const updatedData = { ...originalData, ...userData, age: Number(userData.age) };


      const response = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Enviar todo el objeto completo
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const result = await response.json();
      toast.success("Datos del usuario actualizados correctamente");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Error al actualizar los datos del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient">
      <div
        className={`${
          isSidebarOpen ? "w-56" : "w-0"
        } h-full flex-col fixed inset-y-0 z-30 transition-all duration-300 overflow-hidden`}
      >
        <Sidebar
          toggleSidebar={(state?: boolean) =>
            setIsSidebarOpen(state ?? !isSidebarOpen)
          }
        />
      </div>

      <div className="ml-60 p-6 w-[40rem]">
        {userData && (
          <form className="mt-6 space-y-4 bg-[#FFFCF8] p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

            {Object.entries(userData).map(([key, value]) => {
              // Excluir campos definidos en EXCLUDED_KEYS
              if (EXCLUDED_KEYS.includes(key)) return null;
              if (typeof value === "boolean" || Array.isArray(value)) return null;

              const isSelectField = FIELD_OPTIONS[key]; // Verifica si la clave tiene opciones predefinidas

              return (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {isSelectField ? (
                    <select
                      name={key}
                      value={value || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Seleccione una opción</option>
                      {FIELD_OPTIONS[key].map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={typeof value}
                      name={key}
                      value={value || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      readOnly={key === "emailAddress"} // Deshabilitar campos no editables
                    />
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleSave}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
