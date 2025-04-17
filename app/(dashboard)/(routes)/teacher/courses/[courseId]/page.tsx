'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CourseIdContent from './_components/CourseIdContent';

interface CourseResponse {
  course: any;
  categories: any[];
}

export default function ClientCourseWrapper() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [data, setData] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/courses/getCourses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId }),
        });

        if (!res.ok) {
          router.push('/');
          return;
        }

        const json = await res.json();

        if (!json.course) {
          router.push('/');
          return;
        }

        setData(json);
      } catch (error) {
        console.error("Error fetching course data", error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  if (loading || !data) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <CourseIdContent
      course={data.course}
      categories={data.categories}
      lang="es"
    />
  );
}
