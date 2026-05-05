"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createDraftAction } from "@/app/(app)/editor/actions";

export function CreatePostButton({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [pending, startTransition] = useTransition();
  return (
    <Button
      className={className}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createDraftAction();
          if (!res.ok) {
            toast.error(t("createDraftError"));
            return;
          }
          router.push(`/editor/${res.postId}`);
        })
      }
    >
      <Plus className="mr-1.5 h-4 w-4" />
      {t("newPost")}
    </Button>
  );
}
