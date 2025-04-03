"use client";

import { Label } from "@/components/ui/label";
import { isTeacher } from "@/app/(dashboard)/(routes)/admin/teacher";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

export const Logo = () => {
  const { theme } = useTheme();
  const [isUserTeacher, setIsUserTeacher] = useState(false);
  const [user, setUser] = useState<any>(null); // puedes tipar mejor si tienes UserDB

  useEffect(() => {
    const fetchUserAndCheckRole = async () => {
      const currentUser = await getCurrentUserFromDB();
      setUser(currentUser);

      if (currentUser?.id) {
        const result = await isTeacher(currentUser.id);
        setIsUserTeacher(result);
      }
    };

    fetchUserAndCheckRole();
  }, []);

  return (
    <Link href="/" className="flex flex-col items-center gap-1">
      <Label className="text-xs font-bold">
        {isUserTeacher ? "Teacher" : "Student"}
      </Label>
      <Image
        className="cursor-pointer"
        height={100}
        width={100}
        alt="logo"
        src="/rbtpligth.png"
      />
    </Link>
  );
};
