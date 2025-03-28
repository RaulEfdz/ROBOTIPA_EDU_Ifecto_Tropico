"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Logo = () => {
  const { theme } = useTheme();
  const logoUrl = "rbtpligth.png";
  const { user } = useUser();
  const [isUserTeacher, setIsUserTeacher] = useState(false);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (user?.id) {
        const result = await isTeacher(user.id); // Asegúrate de que isTeacher devuelve una promesa
        setIsUserTeacher(result);
      }
    };
    checkTeacherStatus();
  }, [user]);

  return (
    <Link href="/">
      <Label className="text-xs font-bold">
        {isUserTeacher ? "Teacher" : "Student"}
      </Label>
      <Image
        className="pointer"
        height={100}
        width={100}
        alt="logo"
        src={`/${logoUrl}`}
      />
    </Link>
  );
};
