# TECH.md

Aldente 프로젝트의 파일별 기술 스택 정리 문서. `CLAUDE.md`가 규칙/아키텍처 요약이라면,
이 문서는 "어떤 파일에 어떤 기술이 어떻게 쓰였는지"를 파일 단위로 상세히 기록한다.

## 스택 요약

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 런타임/언어 | React 19, TypeScript 5 |
| 패키지 매니저 | pnpm 10 |
| 인증 | NextAuth.js v4 (JWT 전략) + Google OAuth + Firebase Auth |
| DB | Firestore (Firebase JS SDK, 클라이언트 SDK를 서버에서도 사용) |
| 이미지 스토리지 | AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`) |
| 서버 상태 | TanStack React Query v5 (`useSuspenseInfiniteQuery`, SSR prefetch + `HydrationBoundary`) |
| 클라이언트 상태 | Zustand v5 |
| 지도 | Kakao Maps SDK (`react-kakao-maps-sdk`) |
| 스타일 | Tailwind CSS v4 (CSS-first `@theme`, `tailwind.config.*` 없음) |
| 애니메이션 | Motion (Framer Motion 후신, `motion/react`) |
| 이미지 슬라이더 | Swiper |
| 폰트 | `next/font/local` self-hosting (Pretendard Variable, Aldrich) |
| 린트/포맷 | ESLint 9 flat config + `eslint-config-next` + Prettier |

---

## 루트 설정 파일

| 파일 | 기술 | 설명 |
|---|---|---|
| `next.config.ts` | Next.js Config API | `images.formats: [avif, webp]`, `minimumCacheTTL` 30일, S3/구글/iconfinder `remotePatterns`, next-auth v4 타입 비호환으로 `typescript.ignoreBuildErrors: true` (타입체크는 `pnpm typecheck`로 별도 실행), CORS 헤더 설정 |
| `tsconfig.json` | TypeScript 5, `moduleResolution: bundler` | `baseUrl: src` 기준 경로 alias(`@app`, `@api`, `@components` 등), `kakao.maps.d.ts` 타입 포함 |
| `postcss.config.mjs` | PostCSS | `@tailwindcss/postcss` 플러그인만 등록 (Tailwind v4 방식) |
| `eslint.config.mjs` | ESLint 9 Flat Config | `eslint-config-next` + `eslint-config-prettier` + `eslint-plugin-prettier`, `prettier/prettier` 규칙을 error로 승격 |
| `.prettierrc` | Prettier 3 | 2-space, 세미콜론 유지, `arrowParens: avoid`, `trailingComma: all` |
| `global.d.ts` | TypeScript 모듈 보강 | `window.kakao` 전역 타입 선언, next-auth v4 ↔ Next.js 16 `next/server.js` 서브패스 호환 shim |
| `src/types/next-compat.d.ts` | TypeScript 모듈 보강 | `next/server.js`, `next/dist/build/segment-config/...` 등 Next 16 내부 경로에 대한 `bundler` 모듈 해석 shim |
| `package.json` | pnpm | `dev`/`build`/`start`는 `next` CLI, `lint`는 `eslint ./src`, `typecheck`는 `tsc --noEmit`(별도 스크립트) |

---

## `src/app` — 라우트 & 페이지 (App Router)

| 파일 | 기술 | 설명 |
|---|---|---|
| `layout.tsx` | Next.js Root Layout, `next/font/local` | Pretendard Variable / Aldrich 폰트를 self-host, `ClientProvider`로 감싸고 `Nav` + `Container` 배치 |
| `page.tsx` | RSC, TanStack Query `prefetchInfiniteQuery` + `HydrationBoundary` | 홈 화면. 서버에서 첫 페이지 리뷰 목록을 미리 fetch해 dehydrate된 상태를 클라이언트에 전달 (워터폴 제거, LCP 개선), `dynamic = "force-dynamic"`로 항상 최신 데이터 |
| `loading.tsx` | Next.js `loading.tsx` 컨벤션 | 전역 로딩 스피너 (CSS 커스텀 애니메이션, `globals.css`의 `.loader`) |
| `error.tsx` | Next.js `error.tsx` 컨벤션 (Client Component) | `reset`/`useRouter`로 에러 바운더리 리셋 후 이전 페이지로 이동 |
| `not-found.tsx` | Next.js `not-found.tsx` 컨벤션 | `next/image`로 정적 이미지(`/blank.webp`) 표시 |
| `globals.css` | Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline`) | CSS 변수 기반 폰트/컬러 테마, Swiper 커스텀 스타일, keyframe 애니메이션(slide-in/out), `scrollbar-gutter: stable`로 스크롤바 레이아웃 시프트 방지 |
| `fonts/PretendardVariable.woff2`, `fonts/Aldrich-Regular.ttf` | 정적 폰트 파일 | `next/font/local`이 빌드 타임에 참조 |
| `favicon.ico` | 정적 자산 | — |
| `write/page.tsx` | React Client Component (`useState`/`useRef`), Zustand(`useAlertStore`), TanStack Query(`useWriteReview`) | 리뷰 작성 2-step 폼(장소 선택 → 상세 입력), `clsx`로 slide 애니메이션 클래스 토글 |
| `review/[slug]/page.tsx` | RSC, Server-side `fetch` | 리뷰 상세. 빌드 타임이 아닌 요청 시 `NEXT_PUBLIC_BASE_URL` 기준 절대 URL로 API 호출, 실패 시 `redirect("/404")` |
| `api/auth/[...nextauth]/route.ts` | NextAuth.js v4 App Router adapter | `authOptions`를 `NextAuth()`에 연결해 `GET`/`POST` 핸들러로 export |
| `api/review/route.ts` | Firebase Firestore JS SDK (`firestore` client SDK), NextAuth `getServerSession` | `GET`: `orderBy("date","desc") + limit(5) + startAfter` 커서 페이지네이션, 리뷰별 작성자 정보 N+1 방지를 위해 uid `Set`으로 중복 제거 후 일괄 조회. `POST`: 세션 이메일로 Firestore에서 uid 역조회 후 리뷰 문서 생성. `dynamic = "force-dynamic"`로 캐시 안 함 |
| `api/review/[slug]/route.ts` | Firestore JS SDK | 단건 리뷰 + 작성자 정보 조합 조회, `Timestamp` → `Date` 변환 |
| `api/upload-images/route.ts` | AWS SDK v3 (`@aws-sdk/lib-storage` `Upload`), NextAuth `getServerSession` | 세션 검증 → 파일 MIME 타입 화이트리스트(`ALLOWED_TYPES`) 및 5MB 용량 검증 → S3 멀티파트 업로드(`Upload.done()`) → URL 배열 응답 |

---

## `src/components` — 렌더링 컴포넌트

| 파일 | 기술 | 설명 |
|---|---|---|
| `ReviewList.tsx` | `react-infinite-scroll-component`, `useReviewList` 훅 | 무한 스크롤 컨테이너. 첫 2개 아이템만 `priority`로 넘겨 LCP 최적화 |
| `ReviewItem.tsx` | `next/image`, Motion(`whileInView` fade-in) | 리뷰 카드. `sizes`로 반응형 srcset, `priority` prop으로 선택적 preload, 그라디언트 오버레이로 텍스트 가독성 확보 |
| `RestaurantCard.tsx` | `next/image` | 식당명/카테고리/평점/주소 표시, 별 아이콘도 `Image`로 최적화 |
| `UserCard.tsx` | `next/image`, `date-fns` | 작성자 아바타 + 최근 방문일(`format`) |
| `ImageSwiper.tsx` | Swiper(`Navigation`, `Pagination` 모듈), `next/image` | 리뷰 상세의 다중 이미지 슬라이더 |
| `ImageUpload.tsx` | `useMemo`/`useEffect`(blob URL 라이프사이클 관리), `next/image`(`unoptimized`), 커스텀 `resizeImage` 유틸 | 파일 선택 → `resizeImage`로 리사이즈 → `URL.createObjectURL` 미리보기, 언마운트/변경 시 `URL.revokeObjectURL`로 메모리 해제 |
| `WriteMap.tsx` | Kakao Maps SDK(`Map`, `MapMarker`, `MarkerClusterer`), Web Geolocation API | 키워드 장소 검색(`kakao.maps.services.Places`), 마커 클러스터링, 브라우저 현재 위치로 초기 중심 설정 |
| `ReviewMap.tsx` | Kakao Maps SDK | 리뷰 상세의 단일 위치 지도, 마커 클릭 시 카카오맵 place URL로 이동 |
| `PlaceSearch.tsx` | 순수 React, 인라인 SVG 아이콘 | 장소 검색 입력 + 결과 리스트, 결과 없을 때 `EmptySign` |
| `PlaceCard.tsx` | 순수 React | 선택된 장소 요약 카드 |
| `RatingInput.tsx` | `react-star-ratings` | 별점 입력 UI |
| `ReviewMap.tsx`, `WriteMap.tsx` 공통 | `useKakaoLoader` 커스텀 훅 | Kakao SDK 스크립트 로딩 래핑 |
| `EmptySign.tsx` | 순수 React, 인라인 SVG | 빈 상태(empty state) 표시 |

### `src/components/shared` — 공용 UI

| 파일 | 기술 | 설명 |
|---|---|---|
| `Nav.tsx` | NextAuth(`useSession`, `signIn`, `signOut`), `next/image` | 상단 네비게이션, 로그인 상태별 분기 렌더링 |
| `Button.tsx` | `clsx`, 시맨틱 `<button>` | 활성/비활성 스타일 분기, `disabled`일 때 실제 클릭 차단 |
| `Alert.tsx` | Zustand(`useAlertStore`) | 전역 알림 모달, Store의 `open` 상태로 렌더링 여부 결정 |
| `TextField.tsx` | `clsx` | Enter 키 핸들링(`handleKeyDown`) 지원하는 텍스트 입력 |
| `Container.tsx` | 순수 React | 페이지 콘텐츠 `<main>` 래퍼 |
| `BackButton.tsx` | Next.js `useRouter` | 인라인 SVG 아이콘 + `router.back()` |
| `Loader.tsx` | CSS 애니메이션(`globals.css`의 `.spinner`) | 무한 스크롤 로딩 인디케이터 |

---

## `src/hooks` — 커스텀 훅

| 파일 | 기술 | 설명 |
|---|---|---|
| `useAlertStore.ts` | Zustand `create` | 전역 알림 모달 상태(`open/title/content/buttonLabel/onClose`) |
| `useKakaoLoader.ts` | `react-kakao-maps-sdk`의 `useKakaoLoader` 래핑 | `clusterer`, `drawing`, `services` 라이브러리 로드 |

## `src/queries` — 데이터 페칭 훅 (TanStack Query)

| 파일 | 기술 | 설명 |
|---|---|---|
| `useReviewList.ts` | `useSuspenseInfiniteQuery`, `useCallback` | `fetchReviewList`/`reviewQueryKey`를 export해 `page.tsx`의 서버 prefetch와 공유, `staleTime` 5분, 서버/클라이언트 환경별 base URL 분기 |
| `useWriteReview.ts` | `useMutation` | 이미지 업로드(`/api/upload-images`) 후 리뷰 생성(`/api/review`) 순차 실행하는 뮤테이션 |

## `src/utils` — 외부 클라이언트/유틸

| 파일 | 기술 | 설명 |
|---|---|---|
| `firebase.ts` | Firebase JS SDK(`firebase/app`, `firebase/auth`, `firebase/firestore`) | `getApps()/getApp()` 기반 lazy singleton 초기화 (HMR/서버리스 재초기화 방지) |
| `authOptions.ts` | NextAuth `AuthOptions`, `firebase/auth`, `firebase/firestore` | Google Provider 설정, `signIn` 콜백에서 id_token → Firebase credential 교환 후 Firestore `users` upsert, JWT 세션 24시간 |
| `s3.ts` | AWS SDK v3 `S3Client` | 환경변수 기반 리전/자격증명으로 싱글턴 클라이언트 생성 |
| `resizeImage.ts` | Canvas API(`HTMLCanvasElement`, `CanvasRenderingContext2D`), `Blob` | 업로드 전 클라이언트 사이드 리사이즈(최대 1200px, JPEG 품질 0.85), GIF는 애니메이션 보존을 위해 skip |

## `src/models` — 타입 정의

| 파일 | 설명 |
|---|---|
| `review.ts` | `Review` 인터페이스: 평점/이미지/식당 정보(중첩 객체) 포함 |
| `user.ts` | `User` 인터페이스: Firebase Auth 프로필 필드 |
| `place.ts` | `Place` 인터페이스: Kakao Places API 응답 형태 |

## `src/constants`

| 파일 | 설명 |
|---|---|
| `collections.ts` | Firestore 컬렉션명 상수(`USERS`, `REVIEWS`) — 오타로 인한 컬렉션명 불일치 방지 |

## `src/context`

| 파일 | 기술 | 설명 |
|---|---|---|
| `ClientProvider.tsx` | NextAuth `SessionProvider`, TanStack `QueryClientProvider` | `useState`로 `QueryClient`를 지연 생성해 SSR 요청 간 상태 격리, `staleTime` 5분 기본값 |

## 루트 레벨 특수 파일

| 파일 | 기술 | 설명 |
|---|---|---|
| `src/proxy.ts` | Next.js 16 Proxy(구 Middleware) 컨벤션, NextAuth JWT(`getToken`) | `/write` 경로 보호. HTML 요청은 홈으로 리다이렉트, 그 외(API 등)는 401 JSON 응답. Next 16부터 `middleware.ts` → `proxy.ts` + `export function proxy()`로 명칭 변경됨 |

---

## 참고

- 스타일 관련 전역 규칙, 폴더 구조 원칙, 알려진 이슈는 [CLAUDE.md](./CLAUDE.md) 참고.
  단, 현재 `CLAUDE.md`의 기술 스택 표(Next 15 / Yarn Berry / `middleware.ts`)는 이후 진행된
  Next 16 · pnpm 마이그레이션이 반영되지 않아 이 문서(TECH.md)와 어긋나 있다 — 갱신 필요.
