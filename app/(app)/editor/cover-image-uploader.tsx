"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CoverImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const t = useTranslations("editor");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          size: file.size,
          purpose: "cover",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url, publicUrl } = (await res.json()) as {
        url: string;
        publicUrl: string;
      };
      const put = await fetch(url, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(t("uploadFailed"));
      onChange(publicUrl);
      toast.success(t("uploadSuccess"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="cover" className="w-full object-cover max-h-64" />
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-2 top-2 h-8 w-8"
          onClick={() => onChange(null)}
          aria-label={t("removeCover")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:bg-accent">
      {uploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ImagePlus className="h-4 w-4" />
      )}
      {t("addCover")}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
