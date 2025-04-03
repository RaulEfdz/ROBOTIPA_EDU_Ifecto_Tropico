import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

interface SearchPageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
  };
}

const SearchPage = async ({ searchParams }: any) => {
  const user = await getCurrentUserFromDBServer(); // ✅ Correcto

  if (!user?.id) {
    return redirect("/app/(auth)");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCourses({
    userId: user?.id,
    ...searchParams,
  });

  return (
    <>
    
      <div className="px-6 pt-2 md:hidden block">
        <SearchInput />
      </div>
      <div className="px-4 py-1 space-y-1">
        <Categories items={categories} />
        {courses.length > 0 ? (
          <CoursesList items={courses} />
        ) : (
          <Alert>
            <AlertTitle className="text-lg">No se encontraron cursos</AlertTitle>
            <AlertDescription className="mt-2">
              No hay cursos disponibles en este momento. ¿Por qué no creas uno nuevo?
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default SearchPage;