// components/AnalyticsDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "sonner";

interface AnalyticsData {
  users: { total: number };
  courses: { published: number; unpublished: number; total: number };
  chapters: { free: number; premium: number; total: number };
  purchases: { total: number };
  revenue: { invoicesIssued: number; totalPaidInvoices: number };
  exams: { total: number; published: number; totalAttempts: number };
}

interface AnalyticsResponse {
  data: AnalyticsData;
}

type Tab = "overview" | "courses" | "revenue" | "exams";
type TimeRange = "week" | "month" | "year";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json() as Promise<AnalyticsResponse>)
      .then((res) => {
        setData(res.data);
        toast.success("Analytics loaded successfully");
      })
      .catch(() => toast.error("Error loading analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  // Prepare the data for different chart types
  const courseData = [
    { name: "Published", value: data.courses.published },
    { name: "Unpublished", value: data.courses.unpublished },
  ];

  const chapterData = [
    { name: "Free", value: data.chapters.free },
    { name: "Premium", value: data.chapters.premium },
  ];

  const barData = [
    { name: "Users", total: data.users.total, color: "#4F46E5" },
    { name: "Courses", total: data.courses.total, color: "#10B981" },
    { name: "Chapters", total: data.chapters.total, color: "#F59E0B" },
    { name: "Purchases", total: data.purchases.total, color: "#EF4444" },
    { name: "Invoices", total: data.revenue.invoicesIssued, color: "#8B5CF6" },
    { name: "Exams", total: data.exams.total, color: "#EC4899" },
    { name: "Attempts", total: data.exams.totalAttempts, color: "#06B6D4" },
  ];

  // Mock data for time-based trends
  const trendData = [
    { month: "Jan", users: 650, revenue: 4200, courses: 12 },
    { month: "Feb", users: 730, revenue: 5100, courses: 14 },
    { month: "Mar", users: 810, revenue: 6300, courses: 15 },
    { month: "Apr", users: 920, revenue: 7200, courses: 17 },
    { month: "May", users: 1050, revenue: 8400, courses: 22 },
    { month: "Jun", users: 1250, revenue: 10200, courses: 24 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8B5CF6", "#EC4899"];

  const statsCards = [
    {
      title: "Users",
      value: data.users.total,
      icon: "👥",
      change: "+12%",
      changeColor: "text-green-500",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Revenue",
      value: `$${data.revenue.totalPaidInvoices.toFixed(2)}`,
      icon: "💰",
      change: "+8.5%",
      changeColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Courses",
      value: data.courses.total,
      icon: "📚",
      change: "+5%",
      changeColor: "text-green-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Purchases",
      value: data.purchases.total,
      icon: "🛒",
      change: "+15%",
      changeColor: "text-green-500",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <div className="flex gap-2">
              {(["week", "month", "year"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md ${
                    timeRange === range
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            {(["overview", "courses", "revenue", "exams"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, i) => (
            <div
              key={i}
              className={`${card.bgColor} dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:scale-105`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${card.changeColor}`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="text-3xl">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Trends */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Growth Trends</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderRadius: "0.5rem",
                          border: "none",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="courses"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution */}
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Course Status</h2>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={60}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {courseData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Chapter Types</h2>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chapterData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={60}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chapterData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Summary by Category</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderRadius: "0.5rem",
                        border: "none",
                      }}
                    />
                    <Bar dataKey="total">
                      {barData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Course Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Course Status</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                    <p className="text-2xl font-bold">{data.courses.published}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unpublished</p>
                    <p className="text-2xl font-bold">{data.courses.unpublished}</p>
                  </div>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {courseData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Chapter Analytics</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Free</p>
                    <p className="text-2xl font-bold">{data.chapters.free}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Premium</p>
                    <p className="text-2xl font-bold">{data.chapters.premium}</p>
                  </div>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chapterData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chapterData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold">
                  ${data.revenue.totalPaidInvoices.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  +8.5% from last period
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Invoices Issued</h3>
                <p className="text-3xl font-bold">{data.revenue.invoicesIssued}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  +12% from last period
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderRadius: "0.5rem",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Total Exams</h3>
                <p className="text-3xl font-bold">{data.exams.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  All exams in the system
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Published Exams</h3>
                <p className="text-3xl font-bold">{data.exams.published}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Available to students
                </p>
              </div>
              <div className="bg-cyan-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Total Attempts</h3>
                <p className="text-3xl font-bold">{data.exams.totalAttempts}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Exam submissions
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Total", value: data.exams.total, color: "#8B5CF6" },
                    { name: "Published", value: data.exams.published, color: "#EC4899" },
                    { name: "Attempts", value: data.exams.totalAttempts, color: "#06B6D4" },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderRadius: "0.5rem",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="value">
                    {[
                      { name: "Total", value: data.exams.total, color: "#8B5CF6" },
                      { name: "Published", value: data.exams.published, color: "#EC4899" },
                      { name: "Attempts", value: data.exams.totalAttempts, color: "#06B6D4" },
                    ].map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
