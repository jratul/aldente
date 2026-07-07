# Aldente

식당 리뷰 공유 웹앱 (Next.js 16 App Router). https://aldente2.vercel.app

파일 단위로 어떤 기술이 어떻게 쓰였는지는 [TECH.md](./TECH.md) 참고.

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- **Package Manager**: pnpm 10 — `pnpm install`로 설치
- **Auth**: NextAuth.js v4 (Google OAuth) + Firebase Auth 연동
- **DB**: Firestore (NoSQL) — 클라이언트 SDK를 서버에서도 사용 중
- **Storage**: AWS S3 (이미지 업로드, Seoul 리전)
- **State**: TanStack Query v5 (서버 상태, SSR prefetch + `HydrationBoundary`), Zustand v5 (클라이언트 상태)
- **Maps**: Kakao Maps SDK (식당 검색 및 위치 표시)
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`, `tailwind.config.*` 없음)

## 디렉토리 구조 (경로 alias 기준, `tsconfig.json`)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth 핸들러
│   │   ├── review/               # GET(목록), POST(작성)
│   │   ├── review/[slug]/        # GET(단건)
│   │   └── upload-images/        # S3 이미지 업로드 (세션/타입/용량 검증)
│   ├── review/[slug]/            # 리뷰 상세 (RSC)
│   ├── write/                    # 리뷰 작성 (보호된 라우트)
│   └── page.tsx                  # 홈 (SSR prefetch + 무한 스크롤 목록)
├── components/
│   ├── shared/                   # Nav, Button, Alert, TextField 등
│   └── ...                       # ReviewList, ReviewItem, WriteMap 등
├── context/ClientProvider.tsx    # SessionProvider + QueryClientProvider
├── hooks/
│   ├── useAlertStore.ts          # Zustand 알림 상태
│   └── useKakaoLoader.ts
├── queries/
│   ├── useReviewList.ts          # 무한 스크롤 쿼리 (fetch 함수는 SSR prefetch와 공유)
│   └── useWriteReview.ts         # 리뷰 작성 뮤테이션
├── utils/
│   ├── firebase.ts               # Firebase lazy init (클라이언트 SDK)
│   ├── s3.ts                     # AWS S3 클라이언트
│   ├── authOptions.ts            # NextAuth 설정
│   └── resizeImage.ts            # 업로드 전 클라이언트 사이드 이미지 리사이즈
├── models/                       # TypeScript 인터페이스 (Review, User, Place)
├── constants/collections.ts      # Firestore 컬렉션 이름
├── types/next-compat.d.ts        # Next.js 16 내부 모듈 경로 TS 호환 shim
└── proxy.ts                      # /write 라우트 인증 보호 (Next 16: middleware.ts → proxy.ts)
```

컴포넌트는 렌더링만 담당하고, fetch/변환/상태 로직은 `queries`/`hooks`/`utils`로 분리하는
구조를 따르고 있음 — 새 기능 추가 시 이 패턴 유지.

## Firestore 스키마

```
users/{uid}
  uid, email, displayName, photoURL, lastLogin

reviews/{reviewId}
  uid, date (Timestamp), rating, images[], title, content (JSON string),
  restaurant: { name, pos: {lat, lng}, address, roadAddress, category, placeUrl }
```

## 필수 환경 변수

`.env.local` 파일 필요 (커밋 안 됨):

```
# Firebase
FB_API_KEY
FB_AUTH_DOMAIN
FB_PROJECT_ID
FB_STORAGE_BUCKET
FB_MESSAGING_SENDER_ID
FB_APP_ID
FB_MEASUREMENT_ID

# Google OAuth
GOOGLE_AUTH_CLIENT_ID
GOOGLE_AUTH_CLIENT_SECRET
NEXTAUTH_SECRET

# AWS S3
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME

# Public
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_KAKAO_MAP_APP_KEY
```

## 주요 흐름

### 인증
1. Google OAuth 로그인 → NextAuth가 id_token 수신
2. id_token → Firebase credential 생성 → Firebase Auth signIn
3. Firestore `users` 컬렉션에 사용자 upsert
4. JWT 세션 발급 (24시간)

### 리뷰 작성
1. Kakao Places 검색으로 식당 선택 (step 0)
2. 별점, 이미지(업로드 전 클라이언트 리사이즈), 제목, 내용 입력 (step 1)
3. `/api/upload-images` → S3 업로드 → URL 배열 획득
4. `/api/review` POST → Firestore 저장

### 홈 목록 (SSR prefetch + 무한 스크롤)
- `app/page.tsx`(RSC)에서 첫 페이지를 `prefetchInfiniteQuery`로 미리 fetch,
  `HydrationBoundary`로 클라이언트에 전달해 초기 워터폴 제거
- 이후 스크롤 시 5개씩 로드, `lastVisible` 커서(document ID) 기반 페이지네이션
- `react-infinite-scroll-component` + TanStack Query `useSuspenseInfiniteQuery`

## 개발 명령어

```bash
pnpm dev        # 개발 서버
pnpm build      # 프로덕션 빌드
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit (next.config.ts에서 next-auth v4 타입 비호환으로
                # 빌드 시 타입체크를 끄고 있어 별도 실행 필요)
```

## 알려진 특이사항

- Firestore 클라이언트 SDK를 API Route(서버)에서 사용 중 (Admin SDK 미사용)
- `review.content`는 JSON.stringify된 문자열로 저장됨
- TypeScript 경로 별칭: `@app`, `@components`, `@utils`, `@hooks`, `@queries`, `@models`, `@constants`
- Next.js 16부터 `middleware.ts` 컨벤션이 `proxy.ts` + `export function proxy()`로 변경됨
