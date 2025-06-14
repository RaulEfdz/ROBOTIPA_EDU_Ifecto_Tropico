"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getRoleLabel,
  getAdminId,
  getTeacherId,
  getStudentId,
  getVisitorId,
} from "@/utils/roles/translate";
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

import { countries } from "@/app/data/countries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  metadata?: {
    pais?: string;
    [key: string]: any;
  };
}

// Función helper para obtener las opciones de rol de forma segura
function getRoleOptions() {
  try {
    return [
      { value: "", label: "Todos los roles" },
      { value: getAdminId(), label: getRoleLabel(getAdminId()) },
      { value: getTeacherId(), label: getRoleLabel(getTeacherId()) },
      { value: getStudentId(), label: getRoleLabel(getStudentId()) },
      { value: getVisitorId(), label: getRoleLabel(getVisitorId()) },
    ];
  } catch (error) {
    console.warn("Error getting role options:", error);
    return [
      { value: "", label: "Todos los roles" },
      { value: "admin", label: "Administrador" },
      { value: "teacher", label: "Profesor" },
      { value: "student", label: "Estudiante" },
      { value: "visitor", label: "Visitante" },
    ];
  }
}
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
  const countryName = user.metadata?.pais || "";
  interface Country {
    name: string;
    flag: string;
    code: string;
  }

  const country = countries.find(
    (c: { name: string }): c is Country =>
      c.name.toLowerCase() === countryName.toLowerCase()
  );
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
                <span className="font-semibold">País:</span>{" "}
                <span className="inline-flex items-center gap-1">
                  {country ? (
                    <>
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </>
                  ) : (
                    <span>{countryName || "-"}</span>
                  )}
                </span>
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
  const [onlyActiveToday, setOnlyActiveToday] = useState(false);
  const [onlyWithSubscription, setOnlyWithSubscription] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);

  const [globalStats, setGlobalStats] = useState<any>(null);
  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Compute country distribution and engagement data for charts
  const countryData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const counts: Record<string, number> = {};
    let noCountryCount = 0;

    users.forEach((user) => {
      const country = user.metadata?.pais?.trim() || "";
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      } else {
        noCountryCount++;
      }
    });

    const totalUsers = users.length;
    const data = Object.entries(counts).map(([country, count]) => ({
      country,
      count,
      percentage: parseFloat(((count / totalUsers) * 100).toFixed(2)),
    }));

    if (noCountryCount > 0) {
      data.push({
        country: "Sin País",
        count: noCountryCount,
        percentage: parseFloat(
          ((noCountryCount / totalUsers) * 100).toFixed(2)
        ),
      });
    }

    return data;
  }, [users]);

  const engagementData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const engagementMap: Record<
      string,
      { totalEngagement: number; count: number }
    > = {};
    let noCountryEngagement = { totalEngagement: 0, count: 0 };

    users.forEach((user) => {
      const country = user.metadata?.pais?.trim() || "";
      const engagement = (user as any).roleStats?.engagementScore || 0;

      if (country) {
        if (!engagementMap[country]) {
          engagementMap[country] = { totalEngagement: 0, count: 0 };
        }
        engagementMap[country].totalEngagement += engagement;
        engagementMap[country].count += 1;
      } else {
        noCountryEngagement.totalEngagement += engagement;
        noCountryEngagement.count += 1;
      }
    });

    const data = Object.entries(engagementMap).map(([country, val]) => ({
      country,
      engagement:
        val.count > 0
          ? parseFloat((val.totalEngagement / val.count).toFixed(2))
          : 0,
    }));

    if (noCountryEngagement.count > 0) {
      data.push({
        country: "Sin País",
        engagement:
          noCountryEngagement.count > 0
            ? parseFloat(
                (
                  noCountryEngagement.totalEngagement /
                  noCountryEngagement.count
                ).toFixed(2)
              )
            : 0,
      });
    }

    return data;
  }, [users]);

  // Inicializar opciones de rol
  useEffect(() => {
    setRoleOptions(getRoleOptions());
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users/all");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setUsers(data.users || data); // Handle both old and new format
        setGlobalStats(data.globalStats);
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
        return getRoleLabel(user.customRole);
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
      case "roleStats":
        const roleStats = (user as any).roleStats;
        if (!roleStats) return 0;
        switch (roleStats.type) {
          case "teacher":
            return roleStats.totalStudents || 0;
          case "student":
            return roleStats.overallProgress || 0;
          case "admin":
            return roleStats.daysSinceCreation || 0;
          case "visitor":
            return roleStats.engagementScore || 0;
          default:
            return 0;
        }
      case "generalStats":
        const generalStats = (user as any).generalStats;
        return generalStats?.totalPayments || 0;
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
      // Filtra por ID del rol - manejamos tanto IDs como nombres legacy
      const matchesRole =
        !roleFilter ||
        (() => {
          // Si el filtro es un ID, comparar directamente
          if (u.customRole === roleFilter) return true;

          // Si el filtro es un nombre legacy, convertir y comparar
          try {
            const roleIdByName: { [key: string]: string } = {
              admin: getAdminId(),
              teacher: getTeacherId(),
              student: getStudentId(),
              visitor: getVisitorId(),
            };
            return u.customRole === roleIdByName[roleFilter];
          } catch (error) {
            return false;
          }
        })();
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

      let isActiveToday = true;
      if (onlyActiveToday) {
        isActiveToday =
          !!u.lastSignInAt &&
          new Date(u.lastSignInAt).toDateString() === new Date().toDateString();
      }

      let hasSubscription = true;
      if (onlyWithSubscription) {
        hasSubscription =
          (u as any).generalStats?.hasActiveSubscription || false;
      }

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        hasCourses &&
        isActiveToday &&
        hasSubscription
      );
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
    onlyActiveToday,
    onlyWithSubscription,
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
        <span className="ml-3 text-emerald-700 font-semibold">
          Cargando usuarios...
        </span>
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-auto">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-emerald-700">
        <UserIcon className="w-8 h-8 text-emerald-500" /> Todos los Usuarios
      </h1>

      {/* Dashboard de estadísticas globales */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Usuarios
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {globalStats.totalUsers}
            </div>
            <div className="text-xs text-gray-400">
              {globalStats.activeUsers} activos
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Administradores
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {globalStats.usersByRole.admins}
            </div>
            <div className="text-xs text-gray-400">Acceso completo</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Profesores
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {globalStats.usersByRole.teachers}
            </div>
            <div className="text-xs text-gray-400">Creadores de contenido</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Estudiantes
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {globalStats.usersByRole.students}
            </div>
            <div className="text-xs text-gray-400">Aprendiendo activamente</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Visitantes
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {globalStats.usersByRole.visitors}
            </div>
            <div className="text-xs text-gray-400">Potenciales estudiantes</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Con Compras
            </div>
            <div className="text-2xl font-bold text-green-600">
              {globalStats.usersWithPurchases}
            </div>
            <div className="text-xs text-gray-400">
              {globalStats.totalUsers > 0
                ? `${Math.round((globalStats.usersWithPurchases / globalStats.totalUsers) * 100)}%`
                : "0%"}{" "}
              conversión
            </div>
          </div>
        </div>
      )}
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
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
          <div className="flex items-center">
            <input
              id="onlyActiveToday"
              type="checkbox"
              checked={onlyActiveToday}
              onChange={() => setOnlyActiveToday((v) => !v)}
              className="accent-emerald-600 w-4 h-4 mr-2"
            />
            <label
              htmlFor="onlyActiveToday"
              className="text-sm text-gray-700 dark:text-gray-200 select-none"
            >
              Activos hoy
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="onlyWithSubscription"
              type="checkbox"
              checked={onlyWithSubscription}
              onChange={() => setOnlyWithSubscription((v) => !v)}
              className="accent-emerald-600 w-4 h-4 mr-2"
            />
            <label
              htmlFor="onlyWithSubscription"
              className="text-sm text-gray-700 dark:text-gray-200 select-none"
            >
              Con suscripción
            </label>
          </div>
        </div>
        <Button
          onClick={downloadCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md rounded-lg px-6 py-2"
        >
          Descargar CSV
        </Button>
      </div>
      <div className="flex-grow w-full overflow-x-auto min-h-[60vh]  border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/70 ">
        <table className="min-w-[1200px]  divide-y divide-gray-200 dark:divide-slate-700 text-sm">
          <thead className="bg-emerald-50 dark:bg-slate-800 sticky top-0 z-10">
            <tr>
              {[
                { key: "id", label: "ID" },
                { key: "email", label: "Email" },
                { key: "fullName", label: "Nombre completo" },
                { key: "username", label: "Username" },
                { key: "phone", label: "Teléfono" },
                { key: "customRole", label: "Rol" },
                { key: "pais", label: "País" },
                { key: "roleStats", label: "Métricas del Rol" },
                { key: "lastSignInAt", label: "Último acceso" },
                { key: "isActive", label: "Activo" },
                { key: "generalStats", label: "Actividad General" },
                { key: "createdAt", label: "Registrado" },
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
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 h-[1200px] ">
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
                    className={(() => {
                      try {
                        const isAdmin = user.customRole === getAdminId();
                        const isTeacher = user.customRole === getTeacherId();
                        const isStudent = user.customRole === getStudentId();

                        return `inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          isAdmin
                            ? "bg-emerald-100 text-emerald-700"
                            : isTeacher
                              ? "bg-blue-100 text-blue-700"
                              : isStudent
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                        }`;
                      } catch (error) {
                        // Fallback para comparación por nombres si fallan los IDs
                        const roleLabel = getRoleLabel(
                          user.customRole
                        ).toLowerCase();
                        return `inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          roleLabel.includes("admin")
                            ? "bg-emerald-100 text-emerald-700"
                            : roleLabel.includes("profesor") ||
                                roleLabel.includes("teacher")
                              ? "bg-blue-100 text-blue-700"
                              : roleLabel.includes("estudiante") ||
                                  roleLabel.includes("student")
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                        }`;
                      }
                    })()}
                  >
                    {getRoleLabel(user.customRole)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const countryName = user.metadata?.pais || "";
                    const country = countries.find(
                      (c) => c.name.toLowerCase() === countryName.toLowerCase()
                    );
                    return (
                      <span className="inline-flex items-center gap-1">
                        {country ? (
                          <>
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </>
                        ) : (
                          <span>{countryName || "-"}</span>
                        )}
                      </span>
                    );
                  })()}
                </td>
                {/* Métricas específicas del rol */}
                <td className="px-4 py-3">
                  {(user as any).roleStats ? (
                    (() => {
                      const stats = (user as any).roleStats;
                      switch (stats.type) {
                        case "teacher":
                          return (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {stats.totalCourses}
                                </span>{" "}
                                cursos
                                <span className="text-blue-600">
                                  ({stats.publishedCourses} publicados)
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {stats.totalStudents} estudiantes • $
                                {stats.totalRevenue}
                              </div>
                            </div>
                          );
                        case "student":
                          return (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {stats.enrolledCourses}
                                </span>{" "}
                                cursos
                                <span className="text-purple-600">
                                  ({stats.overallProgress}% progreso)
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {stats.certificatesEarned} certificados
                              </div>
                            </div>
                          );
                        case "admin":
                          return (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {stats.daysSinceCreation}
                                </span>{" "}
                                días
                                {stats.lastActiveToday && (
                                  <span className="text-green-600">
                                    (Activo hoy)
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-600">
                                Acceso completo
                              </div>
                            </div>
                          );
                        case "visitor":
                          return (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {stats.engagementScore}%
                                </span>{" "}
                                engagement
                                <span
                                  className={
                                    stats.potentialValue === "Alto"
                                      ? "text-green-600"
                                      : stats.potentialValue === "Medio"
                                        ? "text-yellow-600"
                                        : "text-gray-600"
                                  }
                                >
                                  ({stats.potentialValue})
                                </span>
                              </div>
                              <div className="text-gray-600">
                                {stats.daysSinceRegistration} días registrado
                              </div>
                            </div>
                          );
                        default:
                          return <span className="text-gray-400">-</span>;
                      }
                    })()
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
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
                {/* Actividad general */}
                <td className="px-4 py-3">
                  {(user as any).generalStats ? (
                    (() => {
                      const stats = (user as any).generalStats;
                      return (
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {stats.totalPayments}
                            </span>{" "}
                            pagos
                            <span className="text-gray-600">
                              • {stats.totalInvoices} facturas
                            </span>
                          </div>
                          {stats.hasActiveSubscription && (
                            <div className="text-green-600">
                              Suscripción activa
                            </div>
                          )}
                          {stats.unreadNotifications > 0 && (
                            <div className="text-orange-600">
                              {stats.unreadNotifications} notificaciones sin
                              leer
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(user.createdAt).toLocaleString()}
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
      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Country Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-emerald-700">
            Distribución de Usuarios por País
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={countryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="country"
                tick={({ x, y, payload }) => {
                  // Buscar la bandera del país
                  const countryName = payload.value;
                  const country = countries.find(
                    (c) => c.name.toLowerCase() === countryName.toLowerCase()
                  );
                  return (
                    <g transform={`translate(${x},${y + 10})`}>
                      {country ? (
                        <foreignObject x={-18} y={-8} width={16} height={16}>
                          <span style={{ fontSize: "16px" }}>
                            {country.flag}
                          </span>
                        </foreignObject>
                      ) : null}
                      <text
                        x={country ? 0 : 0}
                        y={country ? 16 : 0}
                        textAnchor="middle"
                        fill="#334155"
                        style={{ fontSize: 12 }}
                      >
                        {countryName}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Cantidad" />
              <Bar dataKey="percentage" fill="#059669" name="Porcentaje (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Engagement Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-emerald-700">
            Engagement de Usuarios por País
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={engagementData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="engagement" fill="#3B82F6" name="Engagement (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UsersAllPage;
