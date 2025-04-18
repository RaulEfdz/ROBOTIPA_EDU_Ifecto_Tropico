import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";
import { TableMaterialAttach } from "./TableMaterialAttach";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export default async function MaterialAttachPage() {
  const user = await getCurrentUserFromDBServer();

  if (!user?.id) {
    redirect("/");
  }

  const { data, totalSales } = await getAnalytics(user.id);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Material Adjunto</h1>
      <TableMaterialAttach />
    </main>
  );
}
