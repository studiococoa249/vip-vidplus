import type { Metadata } from "next";
import { listActors } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const actors = await listActors();

  return <DashboardClient actors={actors} />;
}
