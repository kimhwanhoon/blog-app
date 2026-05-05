import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function requireOnboardedUser() {
  const session = await requireUser();
  if (!session.user.username) redirect("/onboarding");
  return session as typeof session & { user: { username: string } };
}
