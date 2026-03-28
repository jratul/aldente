# Aldente

맛집 리뷰 공유 웹 서비스. 사용자가 식당을 검색하고, 별점/이미지/글로 리뷰를 작성하며 공유할 수 있다.

배포: https://aldente2.vercel.app

## 기술 스택

- **Framework**: Next.js 15 (App Router), React 19 RC, TypeScript 5
- **Package Manager**: Yarn v4.5.1 (Berry, PnP 모드) — `yarn install`로 설치
- **Auth**: NextAuth.js v4 (Google OAuth) + Firebase Auth 연동
- **DB**: Firestore (NoSQL) — 클라이언트 SDK를 서버에서도 사용 중
- **Storage**: AWS S3 (이미지 업로드, Seoul 리전)
- **State**: TanStack Query v5 (서버 상태), Zustand v5 (클라이언트 상태)
- **Maps**: Kakao Maps SDK (식당 검색 및 위치 표시)
- **Styling**: Tailwind CSS v3

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth 핸들러
│   │   ├── review/               # GET(목록), POST(작성)
│   │   ├── review/[slug]/        # GET(단건)
│   │   └── upload-images/        # S3 이미지 업로드
│   ├── review/[slug]/            # 리뷰 상세 (RSC)
│   ├── write/                    # 리뷰 작성 (보호된 라우트)
│   └── page.tsx                  # 홈 (무한 스크롤 목록)
├── components/
│   ├── shared/                   # Nav, Button, Alert, TextField 등
│   └── ...                       # ReviewList, ReviewItem, WriteMap 등
├── context/ClientProvider.tsx    # SessionProvider + QueryClientProvider
├── hooks/
│   ├── useAlertStore.ts          # Zustand 알림 상태
│   └── useKakaoLoader.ts
├── queries/
│   ├── useReviewList.ts          # 무한 스크롤 쿼리
│   └── useWriteReview.ts         # 리뷰 작성 뮤테이션
├── utils/
│   ├── firebase.ts               # Firebase 초기화 (클라이언트 SDK)
│   ├── s3.ts                     # AWS S3 클라이언트
│   └── authOptions.ts            # NextAuth 설정
├── models/                       # TypeScript 인터페이스 (Review, User, Place)
├── constants/collections.ts      # Firestore 컬렉션 이름
└── middleware.ts                 # /write 라우트 인증 보호
```

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
2. 별점, 이미지, 제목, 내용 입력 (step 1)
3. `/api/upload-images` → S3 업로드 → URL 배열 획득
4. `/api/review` POST → Firestore 저장

### 무한 스크롤
- 5개씩 로드, `lastVisible` 커서 (document ID) 기반 페이지네이션
- `react-infinite-scroll-component` + TanStack Query `useSuspenseInfiniteQuery`

## 개발 명령어

```bash
yarn dev      # 개발 서버
yarn build    # 프로덕션 빌드
yarn lint     # ESLint
```

## 알려진 특이사항

- Firestore 클라이언트 SDK를 API Route(서버)에서 사용 중 (Admin SDK 미사용)
- `review.content`는 JSON.stringify된 문자열로 저장됨
- TypeScript 경로 별칭: `@app`, `@components`, `@utils`, `@hooks`, `@queries`, `@models`, `@constants`
