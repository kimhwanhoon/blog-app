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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("feed.title")}</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("feed.empty")}</p>
      ) : (
        <ul className="space-y-6">
          {items.map((p) => (
            <li key={p.id} className="space-y-2">
              <Link
                href={`/@${p.authorUsername}/${p.slug}`}
                className="block group"
              >
                <h2 className="text-lg font-medium group-hover:underline">
                  {p.title || t("common.untitled")}
                </h2>
                {p.excerpt ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.excerpt}
                  </p>
                ) : null}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  {p.authorImage ? (
                    <AvatarImage src={p.authorImage} alt={p.authorName ?? ""} />
                  ) : null}
                  <AvatarFallback>
                    {(p.authorName ?? p.authorUsername ?? "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/@${p.authorUsername}`}
                  className="hover:text-foreground"
                >
                  {p.authorName ?? `@${p.authorUsername}`}
                </Link>
                <span>·</span>
                <span>{p.publishedAt ? formatDate(p.publishedAt) : ""}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
