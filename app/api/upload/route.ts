import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createPresignedPut, r2Configured } from "@/lib/r2";

const Schema = z.object({
  contentType: z.string().regex(/^image\/(png|jpeg|webp|gif|avif)$/),
  size: z.number().int().positive().max(8 * 1024 * 1024),
  purpose: z.enum(["cover", "inline", "avatar"]).default("inline"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!r2Configured) {
    return NextResponse.json(
      { error: "R2 is not configured" },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const ext = parsed.data.contentType.split("/")[1];
  const key = `${parsed.data.purpose}/${session.user.id}/${nanoid(16)}.${ext}`;
  const { url, publicUrl } = await createPresignedPut({
    key,
    contentType: parsed.data.contentType,
  });
  return NextResponse.json({ url, publicUrl, key });
}
