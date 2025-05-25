// components/AnalyticsDashboard.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
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
// Import the texts and types
import { texts, defaultLanguage, Language, TFunction } from "./locales/locales";

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

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const t: TFunction = (key) =>
    texts[key][language] ?? texts[key][defaultLanguage];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const json: AnalyticsResponse = await res.json();
        setData(json.data);
        toast.success(texts.analyticsLoadedSuccess[language]); // evita dependencia de t
      } catch (error) {
        toast.error(texts.errorLoadingAnalytics[language]); // evita dependencia de t
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // solo corre una vez
  }, []);

  const { courseData, chapterData, barData, trendData, examChartData } =
    useMemo(() => {
      if (!data) {
        return {
          courseData: [],
          chapterData: [],
          barData: [],
          trendData: [],
          examChartData: [],
        };
      }
      const courseData = [
        { name: t("published"), value: data.courses.published },
        { name: t("unpublished"), value: data.courses.unpublished },
      ];
      const chapterData = [
        { name: t("free"), value: data.chapters.free },
        { name: t("premium"), value: data.chapters.premium },
      ];
      const barData = [
        { name: t("users"), total: data.users.total, color: "#4F46E5" },
        { name: t("courses"), total: data.courses.total, color: "#10B981" },
        { name: t("chapters"), total: data.chapters.total, color: "#F59E0B" },
        { name: t("purchases"), total: data.purchases.total, color: "#EF4444" },
        {
          name: t("invoices"),
          total: data.revenue.invoicesIssued,
          color: "#8B5CF6",
        },
        { name: t("exams"), total: data.exams.total, color: "#EC4899" },
        {
          name: t("attempts"),
          total: data.exams.totalAttempts,
          color: "#06B6D4",
        },
      ];
      const trendData = [
        { month: t("monthJan"), users: 650, revenue: 4200, courses: 12 },
        { month: t("monthFeb"), users: 730, revenue: 5100, courses: 14 },
        { month: t("monthMar"), users: 810, revenue: 6300, courses: 15 },
        { month: t("monthApr"), users: 920, revenue: 7200, courses: 17 },
        { month: t("monthMay"), users: 1050, revenue: 8400, courses: 22 },
        { month: t("monthJun"), users: 1250, revenue: 10200, courses: 24 },
      ];
      const examChartData = [
        { name: t("totalExams"), value: data.exams.total, color: "#8B5CF6" },
        {
          name: t("publishedExams"),
          value: data.exams.published,
          color: "#EC4899",
        },
        {
          name: t("totalAttempts"),
          value: data.exams.totalAttempts,
          color: "#06B6D4",
        },
      ];
      return { courseData, chapterData, barData, trendData, examChartData };
    }, [data, t]);

  const statsCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: t("users"),
        value: data.users.total,
        icon: "👥",
        change: "+12%",
        changeColor: "text-green-500",
        bgColor: "bg-emerald-50",
      },
      {
        title: t("revenue"),
        value: `$${data.revenue.totalPaidInvoices.toFixed(2)}`,
        icon: "💰",
        change: "+8.5%",
        changeColor: "text-green-500",
        bgColor: "bg-green-50",
      },
      {
        title: t("courses"),
        value: data.courses.total,
        icon: "📚",
        change: "+5%",
        changeColor: "text-green-500",
        bgColor: "bg-amber-50",
      },
      {
        title: t("purchases"),
        value: data.purchases.total,
        icon: "🛒",
        change: "+15%",
        changeColor: "text-green-500",
        bgColor: "bg-red-50",
      },
    ];
  }, [data, t]);

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8B5CF6",
    "#EC4899",
  ];

  if (loading || !data) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-b-emerald-500 border-l-transparent border-r-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {t("loadingMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t("dashboardTitle")}</h1>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="rounded-md bg-gray-200 px-2 py-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
              {(["week", "month", "year"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-4 py-2 ${
                    timeRange === range
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {t(range as keyof typeof texts)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            {(["overview", "courses", "revenue", "exams"] as Tab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 ${
                    activeTab === tab
                      ? "border-b-2 border-emerald-500 text-emerald-500 font-medium"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t(tab as keyof typeof texts)}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, idx) => (
            <div
              key={idx}
              className={`${card.bgColor} dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:scale-105`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <div className="mt-2 flex items-center">
                    <span className={`text-sm ${card.changeColor}`}>
                      {card.change}
                    </span>
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("vsLastPeriod")}
                    </span>
                  </div>
                </div>
                <div className="text-3xl">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold">
                  {t("growthTrends")}
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
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
                        dataKey="users"
                        name={t("users")}
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        dataKey="revenue"
                        name={t("revenue")}
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        dataKey="courses"
                        name={t("courses")}
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold">
                    {t("courseStatus")}
                  </h2>
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
                          {courseData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold">
                    {t("chapterTypes")}
                  </h2>
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
                          {chapterData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={COLORS[(i + 2) % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold">
                {t("summaryByCategory")}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
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
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === "courses" && (
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">
              {t("courseAnalytics")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-4 text-lg font-medium">
                  {t("courseStatus")}
                </h3>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("published")}
                    </p>
                    <p className="text-2xl font-bold">
                      {data.courses.published}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("unpublished")}
                    </p>
                    <p className="text-2xl font-bold">
                      {data.courses.unpublished}
                    </p>
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
                        {courseData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-4 text-lg font-medium">
                  {t("chapterAnalytics")}
                </h3>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("free")}
                    </p>
                    <p className="text-2xl font-bold">{data.chapters.free}</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("premium")}
                    </p>
                    <p className="text-2xl font-bold">
                      {data.chapters.premium}
                    </p>
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
                        {chapterData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[(i + 2) % COLORS.length]}
                          />
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

        {activeTab === "revenue" && (
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">
              {t("revenueAnalytics")}
            </h2>
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-6 dark:bg-gray-700">
                <h3 className="mb-2 text-lg font-medium">
                  {t("totalRevenue")}
                </h3>
                <p className="text-3xl font-bold">
                  ${data.revenue.totalPaidInvoices.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  +8.5% {t("vsLastPeriod")}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-6 dark:bg-gray-700">
                <h3 className="mb-2 text-lg font-medium">
                  {t("invoicesIssued")}
                </h3>
                <p className="text-3xl font-bold">
                  {data.revenue.invoicesIssued}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  +12% {t("vsLastPeriod")}
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
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
                    dataKey="revenue"
                    name={t("revenue")}
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">
              {t("examStatistics")}
            </h2>
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-purple-50 p-6 dark:bg-gray-700">
                <h3 className="mb-2 text-lg font-medium">{t("totalExams")}</h3>
                <p className="text-3xl font-bold">{data.exams.total}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("allExamsInSystem")}
                </p>
              </div>
              <div className="rounded-lg bg-pink-50 p-6 dark:bg-gray-700">
                <h3 className="mb-2 text-lg font-medium">
                  {t("publishedExams")}
                </h3>
                <p className="text-3xl font-bold">{data.exams.published}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("availableToStudents")}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-6 dark:bg-gray-700">
                <h3 className="mb-2 text-lg font-medium">
                  {t("totalAttempts")}
                </h3>
                <p className="text-3xl font-bold">{data.exams.totalAttempts}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("examSubmissions")}
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examChartData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
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
                    {examChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 bg-white shadow-inner dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("lastUpdated")}{" "}
            {new Date().toLocaleString(language === "en" ? "en-US" : "es-PA")}
          </p>
        </div>
      </footer>
    </div>
  );
};
export default AnalyticsDashboard;
