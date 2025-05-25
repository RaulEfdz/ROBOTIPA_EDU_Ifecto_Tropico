"use client";

import React, { useEffect, useState } from "react";

type User = {
  id: string;
  fullName: string;
  email: string;
};

type Course = {
  id: string;
  title: string;
};

type Certificate = {
  id: string;
  code: string;
  issuedAt: string;
  fileUrl: string;
  user: User;
  course: Course;
};

export default function ManageCertificatesPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for certificate image modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");

  // Fetch data
  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch(() => setError("Error loading users"));

    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses))
      .catch(() => setError("Error loading courses"));

    fetch("/api/admin/certificates")
      .then((res) => res.json())
      .then((data) => setCertificates(data.data))
      .catch(() => setError("Error loading certificates"));
  }, []);

  function openModal(user: User) {
    setSelectedUser(user);
    setSelectedCourseId("");
    setModalOpen(true);
    setError(null);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedUser(null);
    setSelectedCourseId("");
    setError(null);
  }

  async function handleAddCertificate() {
    if (!selectedUser || !selectedCourseId) {
      setError("Please select a course");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/certificates/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          courseId: selectedCourseId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Refresh
      const certRes = await fetch("/api/admin/certificates");
      const certData = await certRes.json();
      setCertificates(certData.data);
      closeModal();
    } catch (err: any) {
      setError(err.message || "Error adding certificate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📄 Manage Certificates
      </h1>

      {error && (
        <div className="mb-4 text-red-600 font-medium bg-red-50 border border-red-200 p-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-auto rounded shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Certificates</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && certificates ? (
              users.map((user) => {
                const userCertificates = certificates.filter(
                  (cert) => cert.user.id === user.id
                );
                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {userCertificates.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {userCertificates.map((cert) => (
                            <li
                              key={cert.id}
                              className="flex items-center space-x-2"
                            >
                              <span>
                                {cert.course.title}{" "}
                                <span className="text-xs text-gray-500">
                                  (Issued:{" "}
                                  {new Date(cert.issuedAt).toLocaleDateString()}
                                  )
                                </span>
                              </span>
                              <button
                                onClick={() => {
                                  setModalImageUrl(cert.fileUrl);
                                  setModalVisible(true);
                                }}
                                className="text-blue-600 hover:underline text-xs"
                                type="button"
                              >
                                Ver
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-gray-400">
                          No certificates
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition"
                      >
                        Add Certificate
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Add Certificate for {selectedUser.fullName}
            </h2>
            <select
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Select a course</option>
              {courses
                .filter(
                  (course) =>
                    !certificates?.some(
                      (cert) =>
                        cert.user.id === selectedUser?.id &&
                        cert.course.id === course.id
                    )
                )
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
            </select>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddCertificate}
                disabled={loading}
              >
                {loading ? "Adding..." : "Confirm"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}

      {/* Certificate Image Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-full p-4 overflow-auto">
            <button
              onClick={() => setModalVisible(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
            >
              ✕
            </button>
            <img
              src={modalImageUrl}
              alt="Certificate"
              className="max-w-full max-h-[80vh] mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
