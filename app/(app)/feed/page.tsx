import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireOnboardedUser } from "@/lib/session";
import { getFeed } from "@/db/queries/posts";
import { formatDate } from "@/lib/utils-app";

export default async function FeedPage() {
  const session = await requireOnboardedUser();
  const items = await getFeed(session.user.id);
  const t = await getTranslations();
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        {t("feed.title")}
      </h1>
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("feed.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/@${p.authorUsername}/${p.slug}`}
                className="block space-y-2 py-7 transition-colors hover:bg-accent/40 -mx-3 px-3 rounded-md"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-xl font-medium leading-snug tracking-tight">
                    {p.title || t("common.untitled")}
                  </h2>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {p.publishedAt ? formatDate(p.publishedAt) : ""}
                  </span>
                </div>
                {p.excerpt ? (
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {p.excerpt}
                  </p>
                ) : null}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    {p.authorImage ? (
                      <AvatarImage src={p.authorImage} alt={p.authorName ?? ""} />
                    ) : null}
                    <AvatarFallback className="text-[10px]">
                      {(p.authorName ?? p.authorUsername ?? "?")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{p.authorName ?? `@${p.authorUsername}`}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
