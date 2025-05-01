-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "examId" TEXT;

-- CreateTable
CREATE TABLE "_CourseExams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CourseExams_AB_unique" ON "_CourseExams"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseExams_B_index" ON "_CourseExams"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseExams" ADD CONSTRAINT "_CourseExams_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseExams" ADD CONSTRAINT "_CourseExams_B_fkey" FOREIGN KEY ("B") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
