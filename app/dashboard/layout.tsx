import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserSession();

  if (!userId) {
    redirect("/");
  }

  const user = await findUserById(userId);

  if (!user) {
    redirect("/");
  }

  if (user.membership === "Free") {
    redirect("/error");
  }

  return children;
}
