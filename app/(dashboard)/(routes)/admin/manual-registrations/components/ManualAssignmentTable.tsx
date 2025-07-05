"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  fullName: string;
  email: string;
  assignedCourses: Course[];
}

interface Course {
  id: string;
  title: string;
}

export function ManualAssignmentTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");

  const fetchUsersWithCourses = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error);

      const purchasesRes = await fetch("/api/admin/purchases");
      const purchasesData = await purchasesRes.json();
      if (!purchasesRes.ok) throw new Error(purchasesData.error);

      const coursesRes = await fetch("/api/admin/courses");
      const coursesData = await coursesRes.json();
      if (!coursesRes.ok) throw new Error(coursesData.error);

      const courseMap: Record<string, Course> = {};
      coursesData.courses.forEach((c: Course) => {
        courseMap[c.id] = c;
      });
      setCourses(coursesData.courses);

      const userCoursesMap: Record<string, Course[]> = {};
      purchasesData.purchases.forEach(
        (p: { userId: string; courseId: string }) => {
          if (!userCoursesMap[p.userId]) userCoursesMap[p.userId] = [];
          const course = courseMap[p.courseId];
          if (course) userCoursesMap[p.userId].push(course);
        }
      );

      const usersWithCourses: User[] = usersData.users.map(
        (u: { id: string; fullName: string; email: string }) => ({
          ...u,
          assignedCourses: userCoursesMap[u.id] || [],
        })
      );
      setUsers(usersWithCourses);
      setFilteredUsers(usersWithCourses);
    } catch (err: any) {
      toast.error(err.message || "Error cargando los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithCourses();
  }, []);

  // Filter users based on search term and course filter
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter) {
      if (courseFilter === "no-courses") {
        filtered = filtered.filter((user) => user.assignedCourses.length === 0);
      } else {
        filtered = filtered.filter((user) =>
          user.assignedCourses.some((course) => course.id === courseFilter)
        );
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, courseFilter]);

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    setSelectedCourseId("");
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setSelectedUser(null);
    setSelectedCourseId("");
    setAssignModalOpen(false);
  };

  const openRevokeModal = (user: User) => {
    setSelectedUser(user);
    setSelectedCourseId("");
    setRevokeModalOpen(true);
  };

  const closeRevokeModal = () => {
    setSelectedUser(null);
    setSelectedCourseId("");
    setRevokeModalOpen(false);
  };

  const handleAssignAccess = async () => {
    if (!selectedUser || !selectedCourseId) {
      toast.error("Selecciona un curso");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/courses/assign-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          courseId: selectedCourseId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Acceso asignado correctamente");
      closeAssignModal();
      await fetchUsersWithCourses();
    } catch (err: any) {
      toast.error(err.message || "Error asignando acceso");
    } finally {
      setAssigning(false);
    }
  };

  const handleRevokeAccessSelected = async () => {
    if (!selectedUser || !selectedCourseId) {
      toast.error("Selecciona un curso para quitar acceso");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/courses/revoke-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          courseId: selectedCourseId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Acceso eliminado correctamente");
      closeRevokeModal();
      await fetchUsersWithCourses();
    } catch (err: any) {
      toast.error(err.message || "Error eliminando acceso");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search and Filter Section */}
      <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar usuarios
            </label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Course Filter */}
          <div className="flex-1">
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por curso
            </label>
            <select
              id="course-filter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos los usuarios</option>
              <option value="no-courses">Sin cursos asignados</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setCourseFilter("");
              }}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Cursos Asignados</th>
              <th className="px-4 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const allCoursesAssigned =
                  user.assignedCourses.length === courses.length;
                return (
                  <tr
                    key={user.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.assignedCourses.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200">
                          {user.assignedCourses.map((course) => (
                            <li key={course.id}>{course.title}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-gray-400">Ninguno</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openAssignModal(user)}
                        disabled={allCoursesAssigned}
                        title={
                          allCoursesAssigned
                            ? "Ya tiene todos los cursos"
                            : "Asignar nuevo curso"
                        }
                        className={`px-3 py-1 rounded text-white text-sm transition ${
                          allCoursesAssigned
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        Dar Acceso
                      </button>
                      <button
                        disabled={
                          !user.assignedCourses ||
                          user.assignedCourses.length === 0
                        }
                        onClick={() => {
                          if (
                            !user.assignedCourses ||
                            user.assignedCourses.length === 0
                          ) {
                            toast.error("El usuario no tiene cursos asignados");
                            return;
                          }
                          // Open modal to select which course to revoke
                          openRevokeModal(user);
                        }}
                        title={
                          !user.assignedCourses || user.assignedCourses.length === 0
                            ? "El usuario no tiene cursos asignados"
                            : "Quitar acceso"
                        }
                        className={`px-3 py-1 rounded text-white text-sm transition ${
                          !user.assignedCourses || user.assignedCourses.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Quitar Acceso
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : users.length > 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No se encontraron usuarios con los filtros aplicados.
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Asignar Acceso a Curso
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usuario: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedUser.fullName}</span>
                </p>
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Curso
              </label>
              <select
                title="Selecciona un curso para asignar"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white transition-colors text-sm"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Seleccione un curso --</option>
                {courses
                  .filter(
                    (c) =>
                      !selectedUser.assignedCourses.some((a) => a.id === c.id)
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id} title={c.title}>
                      {c.title.length > 50 ? `${c.title.substring(0, 50)}...` : c.title}
                    </option>
                  ))}
              </select>
              
              {/* Show full course name if selected */}
              {selectedCourseId && (
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded border text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Curso seleccionado:</span>
                  <p className="text-gray-600 dark:text-gray-400 break-words">
                    {courses.find(c => c.id === selectedCourseId)?.title}
                  </p>
                </div>
              )}
            </div>

            {/* Risk Warning */}
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.138 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Importante - Riesgos al Asignar Acceso
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• El usuario tendrá acceso inmediato al curso completo</li>
                    <li>• Se enviará un email de confirmación automáticamente</li>
                    <li>• Esta acción quedará registrada en el sistema</li>
                    <li>• El acceso será permanente hasta que se revoque manualmente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeAssignModal}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignAccess}
                disabled={!selectedCourseId || assigning}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Asignando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirmar Asignación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quitar Acceso a Curso
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usuario: <span className="font-semibold text-red-600 dark:text-red-400">{selectedUser.fullName}</span>
                </p>
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Curso a Eliminar
              </label>
              <select
                title="Selecciona un curso para revocar"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-colors text-sm"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Seleccione un curso --</option>
                {selectedUser.assignedCourses.map((course: Course) => (
                  <option key={course.id} value={course.id} title={course.title}>
                    {course.title.length > 50 ? `${course.title.substring(0, 50)}...` : course.title}
                  </option>
                ))}
              </select>
              
              {/* Show full course name if selected */}
              {selectedCourseId && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Curso seleccionado:</span>
                  <p className="text-gray-600 dark:text-gray-400 break-words">
                    {selectedUser.assignedCourses.find(c => c.id === selectedCourseId)?.title}
                  </p>
                </div>
              )}
            </div>

            {/* Risk Warning */}
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.138 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                    ⚠️ PELIGRO - Riesgos al Quitar Acceso
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• <strong>ACCIÓN IRREVERSIBLE:</strong> El acceso se eliminará permanentemente</li>
                    <li>• El usuario perderá todo el progreso del curso</li>
                    <li>• Se eliminará el registro de compra/asignación</li>
                    <li>• El usuario no podrá acceder al contenido inmediatamente</li>
                    <li>• Para restaurar el acceso, deberá asignarse nuevamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCourseId ? true : false}
                  readOnly
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Confirmo que entiendo los riesgos y deseo proceder con la eliminación del acceso.
                  <strong className="text-red-600 dark:text-red-400"> Esta acción no se puede deshacer.</strong>
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRevokeModal}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeAccessSelected}
                disabled={!selectedCourseId || assigning}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Confirmar Eliminación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
