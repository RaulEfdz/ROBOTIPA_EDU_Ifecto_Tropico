"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getRoleLabel } from "@/utils/roles/translate";
import {
  User as UserIcon,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  UserX,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string | null;
  customRole: string;
  provider: string;
  lastSignInAt?: string | null;
  isActive: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  additionalStatus: string;
  createdAt: string;
  updatedAt: string;
  courses: any[];
  userProgress: any[];
  purchases: any[];
  invoices: any[];
  examAttempts: any[];
  certificates: any[];
  Subscription?: any | null;
  PaymentMethod: any[];
  Payment: any[];
  AuditLog: any[];
  Notification: any[];
  UserAccess: any[];
  LegalDocument: any[];
}

const roleOptions = [
  { value: "", label: "Todos los roles" },
  { value: "admin", label: getRoleLabel("admin") },
  { value: "teacher", label: getRoleLabel("teacher") },
  { value: "student", label: getRoleLabel("student") },
  { value: "visitor", label: getRoleLabel("visitor") },
];
const statusOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "banned", label: "Baneado" },
  { value: "deleted", label: "Eliminado" },
];

// Modal simple reutilizable
function UserDetailModal({
  user,
  open,
  onClose,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-emerald-600 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-emerald-700 flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-emerald-500" /> {user.fullName}
        </h2>
        <div className="space-y-4">
          {/* Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1">
                <span className="font-semibold">ID:</span>{" "}
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Username:</span> {user.username}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Teléfono:</span>{" "}
                {user.phone || "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Rol:</span>{" "}
                {getRoleLabel(user.customRole)}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Proveedor:</span>{" "}
                {user.provider}
              </div>
            </div>
            <div>
              <div className="mb-1">
                <span className="font-semibold">Activo:</span>{" "}
                {user.isActive ? "Sí" : "No"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Baneado:</span>{" "}
                {user.isBanned ? "Sí" : "No"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Eliminado:</span>{" "}
                {user.isDeleted ? "Sí" : "No"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Estado adicional:</span>{" "}
                {user.additionalStatus}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Último acceso:</span>{" "}
                {user.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleString()
                  : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Creado:</span>{" "}
                {new Date(user.createdAt).toLocaleString()}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Actualizado:</span>{" "}
                {new Date(user.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <hr className="my-2 border-emerald-200 dark:border-slate-700" />
          {/* Info relacional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-emerald-700 mb-1">
                Cursos comprados
              </h3>
              {user.purchases.length === 0 ? (
                <p className="text-gray-500 italic">Ninguno</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.purchases.map((purchase: any) => (
                    <li key={purchase.id}>
                      <span className="font-medium">
                        {purchase.course?.title}
                      </span>
                      {purchase.course?.category && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({purchase.course.category.name})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="font-semibold text-blue-700 mt-4 mb-1">
                Cursos creados
              </h3>
              {user.courses.length === 0 ? (
                <p className="text-gray-500 italic">Ninguno</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.courses.map((course: any) => (
                    <li key={course.id}>
                      <span className="font-medium">{course.title}</span>
                      {course.category && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({course.category.name})
                        </span>
                      )}
                      <span className="ml-2 text-xs text-gray-400">
                        Capítulos: {course.chapters.length}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="font-semibold text-purple-700 mt-4 mb-1">
                Certificados
              </h3>
              {user.certificates && user.certificates.length === 0 ? (
                <p className="text-gray-500 italic">Ninguno</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.certificates &&
                    user.certificates.map((cert: any) => (
                      <li key={cert.id}>
                        {cert.title} - {cert.course?.title}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-orange-700 mb-1">Facturas</h3>
              {user.invoices.length === 0 ? (
                <p className="text-gray-500 italic">Ninguna</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.invoices.map((inv: any) => (
                    <li key={inv.id}>
                      {inv.concept} - {inv.amount} {inv.currency} - {inv.status}
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="font-semibold text-pink-700 mt-4 mb-1">
                Suscripción
              </h3>
              {user.Subscription ? (
                <div className="mb-2">
                  <div>
                    Plan:{" "}
                    <span className="font-medium">
                      {user.Subscription.plan}
                    </span>
                  </div>
                  <div>Activa: {user.Subscription.isActive ? "Sí" : "No"}</div>
                  <div>
                    Inicio:{" "}
                    {new Date(user.Subscription.startDate).toLocaleDateString()}
                  </div>
                  {user.Subscription.endDate && (
                    <div>
                      Fin:{" "}
                      {new Date(user.Subscription.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">Sin suscripción</p>
              )}
              <h3 className="font-semibold text-gray-700 mt-4 mb-1">
                Métodos de pago
              </h3>
              {user.PaymentMethod.length === 0 ? (
                <p className="text-gray-500 italic">Ninguno</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.PaymentMethod.map((pm: any) => (
                    <li key={pm.id}>
                      {pm.type} {pm.provider && `- ${pm.provider}`}{" "}
                      {pm.last4 && `(${pm.last4})`}
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="font-semibold text-green-700 mt-4 mb-1">
                Accesos a herramientas
              </h3>
              {user.UserAccess.length === 0 ? (
                <p className="text-gray-500 italic">Ninguno</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {user.UserAccess.map((ua: any) => (
                    <li key={ua.id}>
                      {ua.tool?.name} ({ua.accessType})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const UsersAllPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [onlyWithCourses, setOnlyWithCourses] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users/all");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Helper para orden seguro
  function getSortValue(user: User, key: string) {
    switch (key) {
      case "id":
        return user.id;
      case "email":
        return user.email;
      case "fullName":
        return user.fullName;
      case "username":
        return user.username;
      case "phone":
        return user.phone || "";
      case "customRole":
        return user.customRole;
      case "provider":
        return user.provider;
      case "lastSignInAt":
        return user.lastSignInAt || "";
      case "isActive":
        return user.isActive ? 1 : 0;
      case "isBanned":
        return user.isBanned ? 1 : 0;
      case "isDeleted":
        return user.isDeleted ? 1 : 0;
      case "additionalStatus":
        return user.additionalStatus;
      case "createdAt":
        return user.createdAt;
      case "updatedAt":
        return user.updatedAt;
      case "purchases":
        return user.purchases?.length || 0;
      case "courses":
        return user.courses?.length || 0;
      case "certificates":
        return user.certificates?.length || 0;
      default:
        return "";
    }
  }

  // Filtrado y ordenamiento
  const filteredUsers = useMemo(() => {
    // Helper para obtener los textos visibles de la fila
    function getVisibleRowString(u: User) {
      const roleLabel = getRoleLabel(u.customRole);
      const lastSignIn = u.lastSignInAt
        ? new Date(u.lastSignInAt).toLocaleString()
        : "-";
      const createdAt = new Date(u.createdAt).toLocaleString();
      const updatedAt = new Date(u.updatedAt).toLocaleString();
      const isActive = u.isActive ? "Sí" : "No";
      const isBanned = u.isBanned ? "Sí" : "No";
      const isDeleted = u.isDeleted ? "Sí" : "No";
      const purchases =
        u.purchases && u.purchases.length > 0
          ? u.purchases
              .map((p: any) => p.course?.title)
              .filter(Boolean)
              .join(", ")
          : "Ninguno";
      const courses =
        u.courses && u.courses.length > 0
          ? u.courses
              .map((c: any) => c.title)
              .filter(Boolean)
              .join(", ")
          : "Ninguno";
      const certificates =
        u.certificates && u.certificates.length > 0
          ? u.certificates
              .map((cert: any) => cert.title)
              .filter(Boolean)
              .join(", ")
          : "Ninguno";
      return [
        u.id,
        u.email,
        u.fullName,
        u.username,
        u.phone || "-",
        roleLabel,
        u.provider,
        lastSignIn,
        isActive,
        isBanned,
        isDeleted,
        u.additionalStatus,
        createdAt,
        updatedAt,
        purchases,
        courses,
        certificates,
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .join(" ");
    }

    let filtered = users.filter((u) => {
      const searchText = search.toLowerCase();
      const visibleRow = getVisibleRowString(u);
      const matchesSearch = visibleRow.includes(searchText);
      // Filtra por label traducido del rol
      const roleLabel = getRoleLabel(u.customRole);
      const matchesRole =
        !roleFilter ||
        (roleLabel &&
          roleLabel.toLowerCase() === getRoleLabel(roleFilter).toLowerCase());
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = u.isActive;
      if (statusFilter === "banned") matchesStatus = u.isBanned;
      if (statusFilter === "deleted") matchesStatus = u.isDeleted;
      let hasCourses = true;
      if (onlyWithCourses) {
        hasCourses =
          (u.courses && u.courses.length > 0) ||
          (u.purchases && u.purchases.length > 0);
      }
      return matchesSearch && matchesRole && matchesStatus && hasCourses;
    });
    filtered = filtered.sort((a, b) => {
      let aVal = getSortValue(a, sortBy);
      let bVal = getSortValue(b, sortBy);
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    sortBy,
    sortDir,
    onlyWithCourses,
  ]);

  // Mejorar el botón de descarga CSV para exportar los datos visibles y formateados
  function downloadCSV() {
    if (users.length === 0) return;
    const headers = [
      "ID",
      "Email",
      "Nombre completo",
      "Username",
      "Teléfono",
      "Rol",
      "Proveedor",
      "Último acceso",
      "Activo",
      "Baneado",
      "Eliminado",
      "Estado adicional",
      "Creado",
      "Actualizado",
      "Cursos creados",
      "Cursos comprados",
      "Certificados",
    ];
    const rows = users.map((user) => [
      user.id,
      user.email,
      user.fullName,
      user.username,
      user.phone || "",
      getRoleLabel(user.customRole),
      user.provider,
      user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "-",
      user.isActive ? "Sí" : "No",
      user.isBanned ? "Sí" : "No",
      user.isDeleted ? "Sí" : "No",
      user.additionalStatus,
      new Date(user.createdAt).toLocaleString(),
      new Date(user.updatedAt).toLocaleString(),
      user.courses && user.courses.length > 0
        ? user.courses
            .map((c: any) => c.title)
            .filter(Boolean)
            .join(", ")
        : "Ninguno",
      user.purchases && user.purchases.length > 0
        ? user.purchases
            .map((p: any) => p.course?.title)
            .filter(Boolean)
            .join(", ")
        : "Ninguno",
      user.certificates && user.certificates.length > 0
        ? user.certificates
            .map((cert: any) => cert.title)
            .filter(Boolean)
            .join(", ")
        : "Ninguno",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) =>
          e.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-emerald-700">
        <UserIcon className="w-8 h-8 text-emerald-500" /> Todos los Usuarios
      </h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end bg-white/80 dark:bg-slate-900/60 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
            Buscar
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, email o username"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 dark:text-gray-100 pr-10 shadow-sm"
            />
            <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        {/* Filtro por Rol oculto intencionalmente */}
        {/*
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
            Rol
          </label>
          <select
            title="Filtrar por rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 dark:text-gray-100 shadow-sm"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        */}
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
            Estado
          </label>
          <select
            title="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 dark:text-gray-100 shadow-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center mt-6">
          <input
            id="onlyWithCourses"
            type="checkbox"
            checked={onlyWithCourses}
            onChange={() => setOnlyWithCourses((v) => !v)}
            className="accent-emerald-600 w-4 h-4 mr-2"
          />
          <label
            htmlFor="onlyWithCourses"
            className="text-sm text-gray-700 dark:text-gray-200 select-none"
          >
            Solo con cursos
          </label>
        </div>
        <Button
          onClick={downloadCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md rounded-lg px-6 py-2"
        >
          Descargar CSV
        </Button>
      </div>
      <div className="flex-grow overflow-auto border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/70">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
          <thead className="bg-emerald-50 dark:bg-slate-800 sticky top-0 z-10">
            <tr>
              {[
                { key: "id", label: "ID" },
                { key: "email", label: "Email" },
                { key: "fullName", label: "Nombre completo" },
                { key: "username", label: "Username" },
                { key: "phone", label: "Teléfono" },
                { key: "customRole", label: "Rol" },
                { key: "provider", label: "Proveedor" },
                { key: "lastSignInAt", label: "Último acceso" },
                { key: "isActive", label: "Activo" },
                { key: "isBanned", label: "Baneado" },
                { key: "isDeleted", label: "Eliminado" },
                { key: "additionalStatus", label: "Estado adicional" },
                { key: "createdAt", label: "Creado" },
                { key: "updatedAt", label: "Actualizado" },
                { key: "purchases", label: "Cursos comprados" },
                { key: "courses", label: "Cursos creados" },
                { key: "certificates", label: "Certificados" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => {
                    if (sortBy === col.key) {
                      setSortDir(sortDir === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy(col.key);
                      setSortDir("asc");
                    }
                  }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredUsers.map((user, idx) => (
              <tr
                key={user.id}
                className={`transition-colors duration-150 cursor-pointer ${
                  idx % 2 === 0
                    ? "bg-white dark:bg-slate-900/60"
                    : "bg-slate-50 dark:bg-slate-800/60"
                } hover:bg-emerald-50 dark:hover:bg-slate-800`}
                onClick={() => setModalUser(user)}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {user.id}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 font-semibold">{user.fullName}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                      user.customRole === "admin"
                        ? "bg-emerald-100 text-emerald-700"
                        : user.customRole === "teacher"
                          ? "bg-blue-100 text-blue-700"
                          : user.customRole === "student"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getRoleLabel(user.customRole)}
                  </span>
                </td>
                <td className="px-4 py-3">{user.provider}</td>
                <td className="px-4 py-3">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.isBanned ? (
                    <Ban className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.isDeleted ? (
                    <UserX className="w-5 h-5 text-gray-400" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                  )}
                </td>
                <td className="px-4 py-3">{user.additionalStatus}</td>
                <td className="px-4 py-3">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {new Date(user.updatedAt).toLocaleString()}
                </td>
                {/* Cursos comprados */}
                <td className="px-4 py-3">
                  {user.purchases && user.purchases.length > 0 ? (
                    user.purchases
                      .map((p: any) => p.course?.title)
                      .filter(Boolean)
                      .join(", ")
                  ) : (
                    <span className="text-gray-400 italic">Ninguno</span>
                  )}
                </td>
                {/* Cursos creados */}
                <td className="px-4 py-3">
                  {user.courses && user.courses.length > 0 ? (
                    user.courses
                      .map((c: any) => c.title)
                      .filter(Boolean)
                      .join(", ")
                  ) : (
                    <span className="text-gray-400 italic">Ninguno</span>
                  )}
                </td>
                {/* Certificados */}
                <td className="px-4 py-3">
                  {user.certificates && user.certificates.length > 0 ? (
                    user.certificates
                      .map((cert: any) => cert.title)
                      .filter(Boolean)
                      .join(", ")
                  ) : (
                    <span className="text-gray-400 italic">Ninguno</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserDetailModal
        user={modalUser}
        open={!!modalUser}
        onClose={() => setModalUser(null)}
      />
    </div>
  );
};

export default UsersAllPage;
