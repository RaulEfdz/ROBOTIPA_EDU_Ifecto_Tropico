import { redirect } from "next/navigation";

import { getAnalytics } from "@/actions/get-analytics";
import { TableMaterialAttach } from "./TableMaterialAttach";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

const Materialattach = async () => {
  const user = await getCurrentUserFromDBServer(); // ✅ Correcto

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