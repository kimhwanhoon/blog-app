"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfileAction } from "./actions";

export function SettingsForm({
  user,
}: {
  user: {
    username: string;
    displayName: string;
    bio: string;
    image: string | null;
  };
}) {
  const t = useTranslations("settings");
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [imageUrl, setImageUrl] = useState<string | null>(user.image);
  const [pending, startTransition] = useTransition();

  async function uploadAvatar(file: File) {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        size: file.size,
        purpose: "avatar",
      }),
    });
    if (!res.ok) {
      toast.error(t("uploadUrlFailed"));
      return;
    }
    const { url, publicUrl } = (await res.json()) as {
      url: string;
      publicUrl: string;
    };
    const put = await fetch(url, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });
    if (!put.ok) {
      toast.error(t("uploadFailed"));
      return;
    }
    setImageUrl(publicUrl);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveProfileAction({ displayName, bio, image: imageUrl });
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(t("saved"));
        });
      }}
      className="space-y-5"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
          <AvatarFallback>
            {(displayName || "?")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <label className="cursor-pointer text-sm text-muted-foreground underline">
          {t("changeAvatar")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAvatar(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label>{t("username")}</Label>
        <Input value={user.username} disabled />
        <p className="text-xs text-muted-foreground">{t("usernameHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder={t("bioPlaceholder")}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
