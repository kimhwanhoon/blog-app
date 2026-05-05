# Blog Platform

velog/Medium 스타일의 멀티 유저 블로그 플랫폼.

## 스택

- **Next.js 16** (App Router, Turbopack, React 19.2)
- **Bun** — 패키지 매니저 / 런타임
- **Drizzle ORM** + **Neon** (serverless Postgres)
- **Better Auth** — 이메일 + (선택) Google/GitHub OAuth
- **Plate.js** — 노션 스타일 블록 에디터
- **shadcn/ui** + Tailwind v4
- **Cloudflare R2** — 이미지 업로드 (presigned PUT URL)
- **next-themes** — 다크모드

## 주요 기능

- `/@username/post-slug` 형태의 사용자 블로그 (next.config.ts `rewrites`)
- 글 발행/초안, 태그, 커버 이미지
- 좋아요 / 북마크 / 댓글 / 팔로우
- 팔로잉 피드

## 설정

### 1. 환경 변수

`.env.example`을 `.env.local`로 복사하고 채워주세요.

```bash
cp .env.example .env.local
```

필수:

- `DATABASE_URL` — [Neon](https://neon.tech) 프로젝트 생성 후 connection string
- `BETTER_AUTH_SECRET` — 32자 이상 랜덤 문자열 (`openssl rand -hex 32`)
- `BETTER_AUTH_URL` — 로컬은 `http://localhost:3000`

선택 (이미지 업로드를 쓰려면):

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET` — 버킷 이름
- `R2_PUBLIC_URL` — R2 public custom domain (예: `https://media.example.com`)
- 버킷의 CORS 정책에 PUT 허용 origin 등록 필요

선택 (OAuth):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### 2. DB 스키마 푸시

```bash
bun run db:push
```

`drizzle-kit push`로 Neon에 스키마 적용. 프로덕션에선 `db:generate` + `db:migrate` 사용 권장.

### 3. 개발 서버

```bash
bun run dev
```

http://localhost:3000

## 스크립트

| 명령 | 설명 |
|---|---|
| `bun run dev` | 개발 서버 (Turbopack) |
| `bun run build` | 프로덕션 빌드 |
| `bun run start` | 프로덕션 서버 |
| `bun run lint` | ESLint |
| `bun run db:push` | 스키마를 DB에 적용 (개발) |
| `bun run db:generate` | 마이그레이션 SQL 생성 |
| `bun run db:migrate` | 마이그레이션 실행 |
| `bun run db:studio` | Drizzle Studio |
| `bun run typegen` | Next.js PageProps/RouteContext 타입 생성 |

## 디렉토리

```
app/
  (auth)/sign-in, sign-up        # Better Auth 폼
  (app)/dashboard, editor, settings, feed, onboarding
  u/[username]/[slug], tag/[tag] # 공개 블로그 (rewrite로 /@user/...)
  api/auth/[...all]              # Better Auth 핸들러
  api/upload                     # R2 presigned URL 발급
components/
  ui/             # shadcn
  editor/         # Plate 에디터
  post/           # post-actions, comment-thread, follow-button
  shared/         # header, theme, user-menu
db/
  schema/auth.ts, blog.ts
  queries/posts.ts
  client.ts
lib/
  auth.ts, auth-client.ts, session.ts
  r2.ts
  plate-html.ts   # Plate JSON → HTML 직렬화
  actions/social.ts
proxy.ts          # Next.js 16에서는 middleware → proxy
```

## Next.js 16 메모

이 프로젝트는 Next.js 16 기준입니다. 기존 13/14/15와 다른 점:

- `params`/`searchParams`/`cookies()`/`headers()` 모두 **async** (Promise)
- `middleware.ts` → **`proxy.ts`** (기능 동일, 이름만 변경)
- Turbopack이 dev/build 기본
- React 19.2 (Server Components, useEffectEvent, Activity)

## 배포 (Vercel)

1. GitHub에 push → Vercel에서 import
2. Install Command를 `bun install`로
3. 환경 변수 모두 등록
4. Edge runtime은 사용하지 않음 (Drizzle/Neon HTTP + Better Auth는 Node가 안정)

## 라이선스

MIT
