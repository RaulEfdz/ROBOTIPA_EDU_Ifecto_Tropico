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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

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
    } catch (err: any) {
      toast.error(err.message || "Error cargando los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithCourses();
  }, []);

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
      const res = await fetch("/api/admin/manual-access/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          courseId: selectedCourseId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Acceso manual eliminado correctamente");
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
            ) : users.length > 0 ? (
              users.map((user) => {
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
                      {/* <button
                        disabled
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
                        title="Quitar acceso"
                        className="px-3 py-1 rounded text-white text-sm bg-red-600 hover:bg-red-700"
                      >
                        Quitar Acceso
                      </button> */}
                    </td>
                  </tr>
                );
              })
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Asignar curso a{" "}
              <span className="text-emerald-600">{selectedUser.fullName}</span>
            </h3>
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-4 dark:bg-gray-800"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Seleccione un curso</option>
              {courses
                .filter(
                  (c) =>
                    !selectedUser.assignedCourses.some((a) => a.id === c.id)
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeAssignModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignAccess}
                disabled={!selectedCourseId || assigning}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {assigning ? "Asignando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Quitar acceso al curso{" "}
              <span className="text-red-600">
                {selectedUser.fullName}
                {selectedCourseId
                  ? ` - ${
                      selectedUser.assignedCourses.find(
                        (c) => c.id === selectedCourseId
                      )?.title || ""
                    }`
                  : ""}
              </span>
            </h3>
            <select
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-4 dark:bg-gray-800"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Seleccione un curso</option>
              {selectedUser.assignedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRevokeModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeAccessSelected}
                disabled={!selectedCourseId || assigning}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {assigning ? "Eliminando..." : "Quitar Acceso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
