"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toggleFollowAction } from "@/lib/actions/social";

export function FollowButton({
  targetId,
  initialFollowing,
}: {
  targetId: string;
  initialFollowing: boolean;
}) {
  const t = useTranslations("post");
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleFollowAction(targetId);
          if ("error" in res) return;
          setFollowing(res.following);
        })
      }
    >
      {following ? t("following") : t("follow")}
    </Button>
  );
}
