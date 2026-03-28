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
