# PROJECT.md

설정 파일이 왜 그렇게 되어 있는지, `package.json`의 패키지가 실제로 어디에 쓰이는지를
정리한 문서. 파일별 구현 디테일은 [TECH.md](./TECH.md), 아키텍처/규칙 요약은
[CLAUDE.md](./CLAUDE.md) 참고.

## 설정 파일

#### `next.config.ts`
- `typescript.ignoreBuildErrors: true` — next-auth v4의 타입 선언이 Next.js 16 내부 타입
  경로와 충돌해서 빌드 시 타입체크를 꺼뒀다. 대신 `pnpm typecheck`(`tsc --noEmit`)를 별도
  스크립트로 돌려 타입 안전성을 확보한다.
- `images.formats: ["image/avif", "image/webp"]` — AVIF를 우선 시도하고 미지원 브라우저는
  WebP로 폴백.
- `images.remotePatterns` — S3(리뷰 이미지), 구글(프로필 사진), iconfinder(정적 아이콘)
  세 출처만 최적화 대상으로 허용.
- `headers()` — `/api/:path*`에 permissive CORS 헤더를 붙인다.

#### `tsconfig.json`
- `moduleResolution: "node"`, `jsx: "react-jsx"` — 표준 Next.js 설정.
- `baseUrl: "src"` + `paths` — `@app`, `@components`, `@queries` 등 경로 alias. 새 최상위
  폴더를 추가하면 이 `paths`에도 매핑을 추가해야 alias가 동작한다.
- `include`에 `.next/types/**/*.ts`, `.next/dev/types/**/*.ts`가 있어 Next.js가 생성하는
  라우트 타입도 타입체크 대상에 포함된다.

#### `eslint.config.mjs`
- ESLint 9 Flat Config. `eslint-config-next`(Next.js 권장 규칙) 위에 `eslint-config-prettier`로
  포맷 관련 규칙을 끄고, `eslint-plugin-prettier`로 `prettier/prettier`를 error로 승격해
  포맷 어긋남 자체를 lint 에러로 잡는다.
- `react/no-unescaped-entities`, `@next/next/no-page-custom-font`는 프로젝트 특성상(한글
  텍스트에 따옴표가 잦고, 폰트는 `next/font/local`로 별도 관리) off 처리.

#### `postcss.config.mjs`
Tailwind v4는 `@tailwindcss/postcss` PostCSS 플러그인 하나로 동작하므로
`tailwind.config.ts` 자체가 없다. 테마 커스터마이징은 `globals.css`의 `@theme inline`에서
CSS 변수로 한다.

#### `.prettierrc`
`singleQuote: false`(더블쿼트), `arrowParens: avoid`(화살표 함수 인자 1개면 괄호 생략),
`trailingComma: all`. ESLint의 `prettier/prettier` 규칙이 이 설정을 그대로 참조한다.

---

## 패키지 목록

### dependencies

| 패키지 | 용도 |
|---|---|
| `next` | 프레임워크 (App Router, Turbopack) |
| `react`, `react-dom` | 런타임 |
| `next-auth` | Google OAuth 로그인, JWT 세션 (`utils/authOptions.ts`) |
| `firebase` | Firestore + Auth 클라이언트 SDK (`utils/firebase.ts`) — 서버(API Route)에서도 이 클라이언트 SDK를 그대로 사용 |
| `@aws-sdk/client-s3`, `@aws-sdk/lib-storage` | 리뷰 이미지 S3 업로드 (`utils/s3.ts`, `api/upload-images/route.ts`) |
| `@tanstack/react-query` | 서버 상태 관리, SSR prefetch + `HydrationBoundary` (`queries/*`, `page.tsx`, `map/page.tsx`) |
| `zustand` | 전역 알림 모달 상태 (`hooks/useAlertStore.ts`) |
| `react-kakao-maps-sdk` | Kakao 지도 (`WriteMap`, `ReviewMap`, `AllRestaurantsMap`, `useKakaoLoader`) |
| `react-infinite-scroll-component` | 홈 리뷰 목록 무한 스크롤 (`ReviewList.tsx`) |
| `swiper` | 리뷰 상세 다중 이미지 슬라이더 (`ImageSwiper.tsx`) |
| `react-star-ratings` | 별점 입력 UI (`RatingInput.tsx`) |
| `motion` | 리뷰 카드 진입 애니메이션 (`ReviewItem.tsx`의 `whileInView`) |
| `date-fns` | 최근 방문일 포맷 (`UserCard.tsx`) |
| `clsx` | 조건부 className 조합 (`Button`, `CategorySelect`, `TextField` 등) |
| `@next-auth/firebase-adapter` | **미사용.** `package.json`에는 있지만 `src` 어디에서도 import되지 않는다 — Firebase 세션 연동은 `authOptions.ts`의 `signIn` 콜백에서 수동으로 처리하고 있어 이 어댑터는 실제로 필요 없다 |
| `firebase-admin` | **미사용.** Firestore 접근은 전부 클라이언트 SDK(`firebase`)로 하고 있어(CLAUDE.md "알려진 특이사항" 참고) Admin SDK는 어디서도 import되지 않는다 |
| `uuid` | **미사용.** 코드베이스 어디에서도 import되지 않는다 |

`@next-auth/firebase-adapter`, `firebase-admin`, `uuid` 세 패키지는 제거해도 현재 동작에
영향이 없어 보인다(제거 전 실제로 어디서도 안 쓰이는지 한 번 더 확인 권장).

### devDependencies

| 패키지 | 용도 |
|---|---|
| `typescript` | 언어 |
| `tailwindcss`, `@tailwindcss/postcss` | 스타일링 (Tailwind v4, CSS-first 설정) |
| `postcss` | `@tailwindcss/postcss`의 실행 엔진 |
| `eslint`, `eslint-config-next`, `eslint-config-prettier`, `eslint-plugin-prettier` | 린트 (`eslint.config.mjs`) |
| `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` | `eslint-config-next`가 내부적으로 사용하는 TS 파서/규칙 |
| `prettier` | 코드 포맷 (`.prettierrc`) |
| `@types/node`, `@types/react`, `@types/react-dom` | 타입 |
| `@types/react-star-ratings` | `react-star-ratings`용 타입 |
| `kakao.maps.d.ts` | 전역 `kakao` 네임스페이스 타입 — `WriteMap`/`ReviewMap` 등에서 `kakao.maps.Map` 같은 타입을 바로 참조할 수 있게 해준다 |

패키지 매니저는 pnpm 10 (`packageManager: "pnpm@10.6.5"`).
