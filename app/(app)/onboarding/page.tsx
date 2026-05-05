import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OnboardingForm } from "./onboarding-form";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const session = await requireUser();
  if (session.user.username) redirect("/dashboard");
  const t = await getTranslations("onboarding");
  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: t.raw("subtitle") as string }}
        />
      </div>
      <OnboardingForm initialName={session.user.name} />
    </div>
  );
}
