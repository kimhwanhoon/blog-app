import Link from "next/link";
import { PenSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireOnboardedUser } from "@/lib/session";
import { getPostsByAuthor } from "@/db/queries/posts";
import { formatDate } from "@/lib/utils-app";
import { CreatePostButton } from "./create-post-button";

export default async function DashboardPage() {
  const session = await requireOnboardedUser();
  const posts = await getPostsByAuthor(session.user.id, true);
  const t = await getTranslations();

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subtitleStart")}
            <Link
              className="text-foreground hover:underline"
              href={`/@${session.user.username}`}
            >
              @{session.user.username}
            </Link>
          </p>
        </div>
        <CreatePostButton />
      </div>

      {posts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-6 py-16 text-center">
          <PenSquare className="mx-auto mb-4 h-6 w-6 text-muted-foreground" />
          <p className="font-heading text-lg text-foreground">
            {t("dashboard.empty")}
          </p>
          <div className="mt-5">
            <CreatePostButton />
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/editor/${p.id}`}
                    className="truncate font-heading text-base font-medium hover:underline"
                  >
                    {p.title || t("common.untitled")}
                  </Link>
                  <Badge
                    variant={p.status === "published" ? "default" : "secondary"}
                    className="font-normal"
                  >
                    {p.status === "published"
                      ? t("dashboard.published")
                      : t("dashboard.draft")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.updatedAt)} ·{" "}
                  {t("dashboard.metaLikes", { count: p.likeCount })} ·{" "}
                  {t("dashboard.metaComments", { count: p.commentCount })} ·{" "}
                  {t("dashboard.metaViews", { count: p.viewCount })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {p.status === "published" ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/@${session.user.username}/${p.slug}`}>
                      {t("common.view")}
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/editor/${p.id}`}>{t("common.edit")}</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
