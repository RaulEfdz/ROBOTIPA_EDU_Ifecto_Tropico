// File: app/(course)/courses/catalog/components/CourseGrid.tsx
import { PublicCourseCard, PublicCourseCardProps } from "./public-course-card";

interface Course {
  id: string;
  title: string;
  imageUrl: string | null;
  chapters: { id: string }[];
  price: number | null;
  category: { id: string; name: string } | null;
  slug?: string;
  description?: string | null;
}

interface CourseGridProps {
  courses: Course[];
  enrolledStatus: Record<string, boolean>;
}

export default function CourseGrid({
  courses,
  enrolledStatus,
}: CourseGridProps) {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => {
        if (!course || !course.id) return null;

        const cardProps: PublicCourseCardProps = {
          id: course.id,
          title: course.title,
          imageUrl: course.imageUrl,
          chaptersCount: course.chapters?.length || 0,
          price: course.price,
          categoryName: course.category?.name || null,
          shortDescription: course.description || null,
          slug: course.slug,
          isEnrolled: enrolledStatus[course.id] || false,
        };

        return <PublicCourseCard key={course.id} {...cardProps} />;
      })}
    </div>
  );
}
