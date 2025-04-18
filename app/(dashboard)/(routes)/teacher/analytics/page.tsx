"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AnalyticsData {
  users: {
    total: number;
  };
  courses: {
    total: number;
    published: number;
    unpublished: number;
  };
  chapters: {
    total: number;
    free: number;
    premium: number;
  };
  purchases: {
    total: number;
  };
  revenue: {
    totalPaidInvoices: number;
    invoicesIssued: number;
  };
  exams: {
    total: number;
    published: number;
    totalAttempts: number;
  };
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .catch(() => toast.error("Error loading analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const courseData = [
    { name: "Published", value: data.courses.published },
    { name: "Unpublished", value: data.courses.unpublished },
  ];

  const chapterData = [
    { name: "Free", value: data.chapters.free },
    { name: "Premium", value: data.chapters.premium },
  ];

  const barData = [
    { name: "Users", total: data.users.total },
    { name: "Courses", total: data.courses.total },
    { name: "Chapters", total: data.chapters.total },
    { name: "Purchases", total: data.purchases.total },
    { name: "Invoices", total: data.revenue.invoicesIssued },
    { name: "Exams", total: data.exams.total },
    { name: "Attempts", total: data.exams.totalAttempts },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Analytics Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>👥 Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.users.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 Courses</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.courses.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎥 Chapters</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.chapters.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛒 Purchases</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.purchases.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${data.revenue.totalPaidInvoices.toFixed(2)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.exams.totalAttempts}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🧪 Exams</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.exams.total}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Resumen General</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos</CardTitle>
            </CardHeader>
            <CardContent className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={courseData} dataKey="value" nameKey="name" outerRadius={60} label>
                    {courseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capítulos</CardTitle>
            </CardHeader>
            <CardContent className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chapterData} dataKey="value" nameKey="name" outerRadius={60} label>
                    {chapterData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
