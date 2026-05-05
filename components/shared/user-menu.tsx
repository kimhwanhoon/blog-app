"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, PenSquare, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

export function UserMenu({
  username,
  name,
  email,
  image,
}: {
  username: string | null;
  name: string;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const t = useTranslations("userMenu");
  const initial = (name?.[0] ?? email[0] ?? "?").toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-sm font-medium leading-none">{name}</div>
          <div className="text-xs text-muted-foreground mt-1">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {username ? (
          <DropdownMenuItem asChild>
            <Link href={`/@${username}`}>
              <User className="mr-2 h-4 w-4" />
              {t("myBlog")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <PenSquare className="mr-2 h-4 w-4" />
            {t("dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
