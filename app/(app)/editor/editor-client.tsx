"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { plateToExcerpt, plateToHtml } from "@/lib/plate-html";
import { slugify } from "@/lib/utils-app";
import {
  publishPostAction,
  savePostAction,
  deletePostAction,
} from "./actions";
import { CoverImageUploader } from "./cover-image-uploader";

function EditorLoading() {
  const t = useTranslations("editor");
  return (
    <div className="text-sm text-muted-foreground">{t("editorLoading")}</div>
  );
}

const PlateEditor = dynamic(
  () => import("@/components/editor/plate-editor").then((m) => m.PlateEditor),
  { ssr: false, loading: () => <EditorLoading /> },
);

type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: unknown;
  coverImageUrl: string | null;
  status: "draft" | "published";
};

export function EditorClient({
  post,
  initialTags,
  username,
}: {
  post: EditorPost;
  initialTags: string[];
  username: string;
}) {
  const router = useRouter();
  const t = useTranslations("editor");
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [tagsText, setTagsText] = useState(initialTags.join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    post.coverImageUrl,
  );
  const [pending, startTransition] = useTransition();

  const initialContent: unknown[] = Array.isArray(post.contentJson)
    ? (post.contentJson as unknown[])
    : [];
  const contentRef = useRef<unknown[]>(initialContent);

  const handleEditorChange = useCallback((value: unknown[]) => {
    contentRef.current = value;
  }, []);

  const tagList = tagsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const onSave = () => {
    const content = contentRef.current;
    startTransition(async () => {
      const res = await savePostAction({
        postId: post.id,
        title,
        excerpt: excerpt || plateToExcerpt(content),
        contentJson: content,
        contentHtml: plateToHtml(content),
        coverImageUrl: coverImageUrl ?? null,
        tags: tagList,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(t("saved"));
    });
  };

  const onPublish = () => {
    if (!title.trim()) return toast.error(t("needTitle"));
    const finalSlug = slug.trim() || slugify(title) || post.id;
    const content = contentRef.current;
    startTransition(async () => {
      const res = await publishPostAction({
        postId: post.id,
        title,
        slug: finalSlug,
        excerpt: excerpt || plateToExcerpt(content),
        contentJson: content,
        contentHtml: plateToHtml(content),
        coverImageUrl: coverImageUrl ?? null,
        tags: tagList,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(t("publishedToast"));
      router.push(`/@${username}/${res.slug}`);
    });
  };

  const onDelete = () => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      await deletePostAction(post.id);
      toast.success(t("deleted"));
      router.push("/dashboard");
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {post.status === "published" ? t("statusPublished") : t("statusDraft")}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={pending}
          >
            {t("delete")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={pending}
          >
            {pending ? t("saving") : t("save")}
          </Button>
          <Button size="sm" onClick={onPublish} disabled={pending}>
            {post.status === "published" ? t("republish") : t("publish")}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <Input
          placeholder={t("titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="!h-auto !text-4xl font-heading font-medium tracking-tight !border-0 !shadow-none !bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
        />
        <CoverImageUploader value={coverImageUrl} onChange={setCoverImageUrl} />
      </div>

      <PlateEditor initialValue={initialContent} onChange={handleEditorChange} />

      <div className="space-y-5 border-t border-border/60 pt-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="slug"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              {t("slugLabel")}
            </Label>
            <Input
              id="slug"
              placeholder={slugify(title) || t("slugPlaceholder")}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("slugHint", {
                username,
                slug: slug || slugify(title) || "...",
              })}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="tags"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              {t("tagsLabel")}
            </Label>
            <Input
              id="tags"
              placeholder={t("tagsPlaceholder")}
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="excerpt"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            {t("excerptLabel")}
          </Label>
          <Textarea
            id="excerpt"
            placeholder={t("excerptPlaceholder")}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
