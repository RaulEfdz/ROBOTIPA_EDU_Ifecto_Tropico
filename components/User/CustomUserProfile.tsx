"use client";

import React, { useState } from "react";
import { UserButton, UserProfile, useUser, useAuth } from "@clerk/nextjs";

const DotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
  </svg>
);

const CustomUserPage = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return <div>Cargando información del usuario...</div>;

  const formatDate = (date: Date | null) => {
    return date ? new Date(date).toLocaleDateString() : "No disponible";
  };

  const formatDateTime = (date: Date | null) => {
    return date ? new Date(date).toLocaleString() : "No disponible";
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUpdating(true);
    try {
      if (!userId) throw new Error("ID de usuario no disponible");

      await user.update({
        username: newUsername,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el nombre de usuario:", error);
      setError(
        "No se pudo actualizar el nombre de usuario. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-heading mb-4">
        Página Personalizada
      </h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-heading">
          Información básica
        </h2>
        <p className="text-text-body">Nombre: {user.fullName}</p>
        {isEditing ? (
          <form onSubmit={handleUsernameUpdate} className="mt-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-bg-base border border-border-default text-text-heading rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary mr-2"
              disabled={isUpdating}
            />
            <button
              type="submit"
              className={`bg-brand-primary text-bg-base font-semibold px-4 py-1.5 rounded-md hover:bg-brand-accent transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isUpdating}
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="ml-2 bg-bg-base border border-border-default text-text-heading px-4 py-1.5 rounded-md hover:bg-brand-accent/10 transition-colors"
              disabled={isUpdating}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <p className="text-text-body">
            Nombre de usuario: {user.username || "No establecido"}
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-brand-primary"
            >
              Editar
            </button>
          </p>
        )}
        {error && <p className="text-destructive mt-2">{error}</p>}
        <p className="text-text-body">
          Email: {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-heading">
          Detalles de la cuenta
        </h2>
        <p className="text-text-body">
          Cuenta creada: {formatDate(user.createdAt)}
        </p>
        <p className="text-text-body">
          Último inicio de sesión: {formatDateTime(user.lastSignInAt)}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-heading">Seguridad</h2>
        <p className="text-text-body">
          2FA activado: {user.twoFactorEnabled ? "Sí" : "No"}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-text-heading">
          Progreso en la plataforma
        </h2>
        <p className="text-text-body">Cursos completados: 0</p>
      </div>
    </div>
  );
};

const CustomUserProfile = () => {
  return (
    <UserButton>
      <UserProfile.Page label="Uso" url="custom" labelIcon={<DotIcon />}>
        <CustomUserPage />
      </UserProfile.Page>

      <UserProfile.Page label="account" />
      <UserProfile.Page label="security" />
    </UserButton>
  );
};

export default CustomUserProfile;
