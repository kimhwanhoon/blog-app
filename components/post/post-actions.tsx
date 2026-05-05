"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toggleBookmarkAction,
  toggleLikeAction,
} from "@/lib/actions/social";

export function PostActions({
  postId,
  initialLiked,
  initialBookmarked,
  initialLikes,
  initialBookmarks,
  commentCount,
  isAuthenticated,
}: {
  postId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialLikes: number;
  initialBookmarks: number;
  commentCount: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("post");
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [pending, startTransition] = useTransition();

  function gate() {
    if (!isAuthenticated) {
      toast.message(t("signInFirst"));
      router.push("/sign-in");
      return false;
    }
    return true;
  }

  return (
    <div className="flex items-center gap-1 border-y border-border/60 py-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        className={liked ? "text-foreground" : "text-muted-foreground"}
        onClick={() => {
          if (!gate()) return;
          startTransition(async () => {
            const res = await toggleLikeAction(postId);
            if (!res.ok) return;
            setLiked(res.liked);
            setLikes((n) => n + (res.liked ? 1 : -1));
          });
        }}
      >
        <Heart className={`mr-1.5 h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {likes}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        className={bookmarked ? "text-foreground" : "text-muted-foreground"}
        onClick={() => {
          if (!gate()) return;
          startTransition(async () => {
            const res = await toggleBookmarkAction(postId);
            if (!res.ok) return;
            setBookmarked(res.bookmarked);
            setBookmarks((n) => n + (res.bookmarked ? 1 : -1));
          });
        }}
      >
        <Bookmark
          className={`mr-1.5 h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
        />
        {bookmarks}
      </Button>
      <div className="ml-auto flex items-center gap-1.5 px-3 text-xs text-muted-foreground">
        <MessageCircle className="h-3.5 w-3.5" />
        {commentCount}
      </div>
    </div>
  );
}
