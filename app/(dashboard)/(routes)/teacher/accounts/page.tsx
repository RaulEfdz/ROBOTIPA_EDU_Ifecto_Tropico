import TableUsers from "./TableUsers";
import { db } from "@/lib/db";

export default async function Page() {
  const users: any = await db.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });


  return (
    <>
      <TableUsers users={users}/>
    </>
  );
}