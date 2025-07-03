import { redirect } from "next/navigation";

export default async function Dashboard() {
  return redirect("/courses/catalog");
}
