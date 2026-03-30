# Aldente

식당 리뷰 공유 프로젝트입니다.
https://aldente2.vercel.app

## Powered by

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34" />

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Auth**: NextAuth.js v4 (Google OAuth) + Firebase Auth
- **DB**: Firestore
- **Storage**: AWS S3
- **State**: TanStack Query v5, Zustand v5
- **Maps**: Kakao Maps SDK
- **Styling**: Tailwind CSS v4

## 개발 내용

- Infinite Scroll로 리뷰 무한 스크롤 (TanStack Query)
- 카카오 지도 API 연동으로 식당 위치 검색 및 지정
- Motion으로 리뷰 아이템 진입 애니메이션
- AWS S3 리뷰 이미지 업로드
- Google OAuth 로그인

## 기술적 포인트

### SSR + TanStack Query HydrationBoundary로 LCP 개선

홈 페이지의 리뷰 목록이 클라이언트에서만 fetch되면 "HTML 수신 → JS 파싱 → React hydration → API 요청 → 이미지 렌더"의 3단계 워터폴이 발생한다. RSC에서 데이터를 미리 prefetch하고 dehydrated state를 HTML에 포함시켜 클라이언트 API 왕복을 제거했다.

```
Before  HTML → JS → hydration → fetch /api/review → 이미지 렌더  (LCP ~2.5s)
After   HTML(데이터 포함) → hydration → 이미지 즉시 렌더          (LCP ~2.1s)
```

```tsx
// app/page.tsx (RSC)
export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({ queryKey, queryFn });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewList /> {/* 클라이언트: 캐시를 즉시 읽음, fetch 생략 */}
    </HydrationBoundary>
  );
}
```

`ClientProvider`는 `useState`로 QueryClient를 생성해 SSR 환경에서 요청 간 상태가 공유되지 않도록 격리한다.

---

### 업로드 전 클라이언트 사이드 이미지 리사이즈

스마트폰 사진(최대 15MB)을 원본 그대로 S3에 저장하면 Vercel Image Optimization이 S3에서 원본을 가져와 변환하는 첫 요청(cold start)이 느리다. 업로드 전 브라우저 Canvas API로 max 1200px 이하로 리사이즈해 S3에 저장한다.

```
Before  S3에 ~8MB 저장 → Vercel이 8MB 가져와 AVIF 변환 → 느린 cold start
After   S3에 ~300KB 저장 → 변환 부담 감소 → 빠른 cold start
```

```ts
// utils/resizeImage.ts
canvas.width = Math.round(width * ratio);  // max 1200px 유지 비율
ctx.drawImage(img, 0, 0, newWidth, newHeight);
canvas.toBlob(callback, "image/jpeg", 0.85);
// GIF는 애니메이션 손실 방지를 위해 skip
```

---

### Next.js Image 최적화

```ts
// next.config.ts
images: {
  formats: ["image/avif", "image/webp"],  // AVIF 우선, 미지원 시 WebP fallback
  minimumCacheTTL: 60 * 60 * 24 * 30,    // 30일 CDN 캐시
}
```

- 첫 두 리뷰 이미지에 `priority={true}` → `fetchpriority="high"` 적용, 브라우저가 LCP 이미지를 조기 요청
- `sizes="(max-width: 768px) 100vw, 768px"` → 뷰포트별 적정 해상도만 요청

---

### 폰트 Self-hosting

`next/font/local`로 Google Fonts CDN 왕복(렌더 블로킹) 없이 폰트를 제공한다. Pretendard는 Variable Font(단일 `.woff2` 파일로 모든 굵기 대응)를 사용해 요청 수를 최소화한다. `display: "swap"`으로 텍스트가 즉시 렌더되고 폰트 로드 후 교체된다.

---

### Firebase Lazy Initialization

Firebase v12부터 `instanceof` 검사가 엄격해져 Proxy로 감싼 객체가 내부 타입 체크를 통과하지 못한다. 기존 Proxy 패턴을 제거하고 getter 함수로 lazy init하도록 변경했다.

```ts
let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}
// ❌ export const auth = new Proxy(...)  → v12에서 instanceof 실패
```

---

### 인증 흐름

```
Google OAuth → NextAuth id_token 수신
  → Firebase credential 생성 → Firebase Auth signIn
  → Firestore users 컬렉션 upsert
  → JWT 세션 발급 (24시간)
```

---

### 접근성 (Accessibility)

WCAG AA 색상 대비 기준(일반 텍스트 4.5:1) 미달 항목을 수정했다.

| 변경 전 | 변경 후 | 대비율 변화 |
|---|---|---|
| `text-gray-500` on white | `text-gray-600` | 3.95 → 5.74 ✓ |
| `text-blue-500` on white | `text-blue-600` | 3.92 → 4.98 ✓ |

`<nav>`, `<main>` 시맨틱 랜드마크 적용.

## 시작하기

### 요구 사항

- Node.js 20+
- pnpm

### 설치

```bash
pnpm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
# Firebase
FB_API_KEY=
FB_AUTH_DOMAIN=
FB_PROJECT_ID=
FB_STORAGE_BUCKET=
FB_MESSAGING_SENDER_ID=
FB_APP_ID=
FB_MEASUREMENT_ID=

# Google OAuth
GOOGLE_AUTH_CLIENT_ID=
GOOGLE_AUTH_CLIENT_SECRET=
NEXTAUTH_SECRET=

# AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=

# Public
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=
```

### 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000 에서 확인합니다.

### 빌드

```bash
pnpm build
pnpm start
```

### 린트 / 타입 체크

```bash
pnpm lint
pnpm typecheck
```
