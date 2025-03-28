// "use client"
import { redirect } from "next/navigation";

import { getAnalytics } from "@/actions/get-analytics";
import { TableMaterialAttach } from "./TableMaterialAttach";
import { currentUser } from "@clerk/nextjs/server";

const Materialattach = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/app/(auth)");
  }
  const {
    data,
    totalSales,
  } = await getAnalytics(user?.id);

  return ( 
    <div className="p-6">
    <TableMaterialAttach/>
    </div>
   );
}
 
export default Materialattach;