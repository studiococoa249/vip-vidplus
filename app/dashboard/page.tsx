import { listActors } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const actors = await listActors();

  return <DashboardClient actors={actors} />;
}
