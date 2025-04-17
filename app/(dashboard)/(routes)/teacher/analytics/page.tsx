import { redirect } from "next/navigation";

import { getAnalytics } from "@/actions/get-analytics";

import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";

import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

const AnalyticsPage = async () => {
  const user = await getCurrentUserFromDBServer(); // ✅ Correcto

  

  if (!user?.id) {
    return redirect("/");
  }

  const {
    data,
    totalSales,
  } = await getAnalytics(user?.id);

  return ( 
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      
        <DataCard
          label="Inscripciones"
          value={totalSales}
        />
      </div>
      <Chart
        data={data}
      />
    </div>
   );
}
 
export default AnalyticsPage;