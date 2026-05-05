"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addCommentAction,
  deleteCommentAction,
} from "@/lib/actions/social";
import { formatDate } from "@/lib/utils-app";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  parentId: string | null;
  authorId: string;
  authorName: string | null;
  authorUsername: string | null;
  authorImage: string | null;
};

export function CommentThread({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const t = useTranslations("post");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {currentUserId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = body.trim();
            if (!trimmed) return;
            startTransition(async () => {
              const res = await addCommentAction({ postId, body: trimmed });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setBody("");
              router.refresh();
            });
          }}
          className="space-y-2"
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("commentPlaceholder")}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending || !body.trim()}>
              {pending ? t("commentSubmitting") : t("commentSubmit")}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loginToComment")}</p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noComments")}</p>
      ) : (
        <ul className="space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                {c.authorImage ? (
                  <AvatarImage src={c.authorImage} alt={c.authorName ?? ""} />
                ) : null}
                <AvatarFallback>
                  {(c.authorName ?? c.authorUsername ?? "?")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {c.authorName ?? `@${c.authorUsername}`}
                  </span>
                  <span>·</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                {currentUserId === c.authorId ? (
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteCommentAction(c.id);
                        router.refresh();
                      })
                    }
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("commentDelete")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
