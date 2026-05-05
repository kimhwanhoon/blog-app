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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subtitleStart")}
            <Link
              className="underline hover:text-foreground"
              href={`/@${session.user.username}`}
            >
              @{session.user.username}
            </Link>
          </p>
        </div>
        <CreatePostButton />
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <PenSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("dashboard.empty")}</p>
          <CreatePostButton className="mt-4" />
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/editor/${p.id}`}
                    className="truncate text-base font-medium hover:underline"
                  >
                    {p.title || t("common.untitled")}
                  </Link>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>
                    {p.status === "published"
                      ? t("dashboard.published")
                      : t("dashboard.draft")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(p.updatedAt)} ·{" "}
                  {t("dashboard.metaLikes", { count: p.likeCount })} ·{" "}
                  {t("dashboard.metaComments", { count: p.commentCount })} ·{" "}
                  {t("dashboard.metaViews", { count: p.viewCount })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.status === "published" ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/@${session.user.username}/${p.slug}`}>
                      {t("common.view")}
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" size="sm">
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
