import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OnboardingForm } from "./onboarding-form";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const session = await requireUser();
  if (session.user.username) redirect("/dashboard");
  const t = await getTranslations("onboarding");
  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: t.raw("subtitle") as string }}
        />
      </div>
      <OnboardingForm initialName={session.user.name} />
    </div>
  );
}
