# TECH.md

Aldente 프로젝트의 파일별 기술 스택 정리 문서. `CLAUDE.md`가 규칙/아키텍처 요약이라면,
이 문서는 "어떤 파일에 어떤 기술이 어떻게 쓰였는지"를 파일 단위로, 핵심 코드 조각과 함께
상세히 기록한다.

## 스택 요약

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 런타임/언어 | React 19, TypeScript 5 |
| 패키지 매니저 | pnpm 10 |
| 인증 | NextAuth.js v4 (JWT 전략) + Google OAuth + Firebase Auth |
| DB | Firestore (Firebase JS SDK, 클라이언트 SDK를 서버에서도 사용) |
| 이미지 스토리지 | AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`) |
| 서버 상태 | TanStack React Query v5 (`useSuspenseInfiniteQuery`/`useSuspenseQuery`, SSR prefetch + `HydrationBoundary`) |
| 클라이언트 상태 | Zustand v5 |
| 지도 | Kakao Maps SDK (`react-kakao-maps-sdk`) |
| 스타일 | Tailwind CSS v4 (CSS-first `@theme`, `tailwind.config.*` 없음) |
| 애니메이션 | Motion (Framer Motion 후신, `motion/react`) |
| 이미지 슬라이더 | Swiper |
| 폰트 | `next/font/local` self-hosting (Pretendard Variable, Aldrich) |
| 린트/포맷 | ESLint 9 flat config + `eslint-config-next` + Prettier |

패키지별로 "왜 추가했는가"는 [PROJECT.md](./PROJECT.md) 참고.

---

## 루트 설정 파일

#### `next.config.ts`
Next.js Config API. AVIF 우선 이미지 포맷, 30일 CDN 캐시, S3/구글/iconfinder 원격 이미지
허용. next-auth v4 타입이 Next 16 내부 타입과 안 맞아 빌드 시 타입체크를 끄고
`pnpm typecheck`로 별도 실행한다.
```ts
images: {
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 60 * 60 * 24 * 30,
  remotePatterns: [{ protocol: "https", hostname: "*.s3.ap-northeast-2.amazonaws.com" }],
},
typescript: { ignoreBuildErrors: true },
```

#### `tsconfig.json`
TypeScript 5, `moduleResolution: node`, `jsx: react-jsx`. `baseUrl: src` 기준 경로 alias.
```json
"baseUrl": "src",
"paths": {
  "@components/*": ["components/*"],
  "@queries/*": ["queries/*"]
}
```

#### `postcss.config.mjs`
Tailwind v4는 PostCSS 플러그인 하나로 동작한다(`tailwind.config.*` 불필요).
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

#### `eslint.config.mjs`
ESLint 9 Flat Config. `eslint-config-next` + Prettier 통합, `prettier/prettier`를 error로 승격.
```js
export default [
  ...nextConfig,
  prettierConfig,
  { plugins: { prettier: prettierPlugin }, rules: { "prettier/prettier": ["error", { endOfLine: "auto" }] } },
];
```

#### `.prettierrc`
```json
{ "singleQuote": false, "trailingComma": "all", "semi": true, "arrowParens": "avoid" }
```

#### `global.d.ts`
전역 타입 보강. Kakao SDK는 공식 타입이 `window.kakao`를 커버하지 못해 `any`로 선언하고,
next-auth v4 ↔ Next 16 `next/server.js` 서브패스 호환 shim도 여기 둔다.
```ts
declare global {
  interface Window {
    kakao: any;
  }
}
declare module "next/server.js" {
  export * from "next/server";
}
```

#### `src/types/next-compat.d.ts`
Next.js 16 내부 모듈 경로(`next/dist/...`)를 `bundler` moduleResolution이 못 찾아서 만든
TS 전용 shim. 런타임에는 영향 없음.
```ts
declare module "next/server.js" {
  export { NextRequest } from "next/dist/server/web/spec-extension/request";
  export { NextResponse } from "next/dist/server/web/spec-extension/response";
}
```

#### `package.json`
pnpm 워크스페이스. `typecheck`가 별도 스크립트인 이유는 위 `next.config.ts` 참고.
```json
"scripts": {
  "dev": "next dev",
  "lint": "eslint ./src",
  "typecheck": "tsc --noEmit"
}
```

---

## `src/app` — 라우트 & 페이지 (App Router)

#### `layout.tsx`
Root Layout. `next/font/local`로 폰트를 self-host해 Google Fonts CDN 왕복을 없앤다.
```tsx
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});
```

#### `page.tsx`
홈. RSC에서 첫 페이지를 미리 `prefetchInfiniteQuery`로 받아 `HydrationBoundary`로 넘겨
클라이언트의 재요청 워터폴을 없앤다(자세한 배경은 README "기술적 포인트" 참고).
```tsx
export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: reviewQueryKey,
    queryFn: fetchReviewList,
    initialPageParam: undefined,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewList />
    </HydrationBoundary>
  );
}
```

#### `loading.tsx`
Next.js `loading.tsx` 컨벤션 — 루트에 하나만 있으면 모든 하위 라우트(홈/지도/작성 등)의
Suspense 경계로 자동 적용된다.
```tsx
export default function Loading() {
  return (
    <div className="w-full h-[500px] flex justify-center items-center flex-col gap-4">
      <span className="loader border-red-500 border-4" />
    </div>
  );
}
```

#### `error.tsx`
Next.js `error.tsx` 컨벤션. `reset()`을 실제로 호출해 에러 바운더리를 리셋한 뒤 이전
페이지로 이동한다.
```tsx
export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();
  const handleButtonClick = () => {
    reset();
    router.back();
  };
  ...
}
```

#### `not-found.tsx`
`next/image`로 정적 이미지(`/blank.webp`)를 최적화해 보여준다.
```tsx
<Image src="/blank.webp" alt="blank" width={400} height={400} />
```

#### `globals.css`
Tailwind v4 CSS-first 설정. `scrollbar-gutter: stable`로 스크롤바 유무에 따른 레이아웃
시프트를 막는다(과거엔 `calc(100vw - 8px)` 하드코딩 방식이었다가 교체).
```css
@import "tailwindcss";

html {
  scrollbar-gutter: stable;
}
```

#### `fonts/PretendardVariable.woff2`, `fonts/Aldrich-Regular.ttf`
정적 폰트 파일. `layout.tsx`의 `localFont({ src: "./fonts/..." })`가 빌드 타임에 참조한다
(위 `layout.tsx` 항목 코드 블록 참고).

#### `favicon.ico`
Next.js 파일 컨벤션으로 `/favicon.ico`에 자동 서빙된다. 코드에서 별도로 참조하지 않는다.
```
src/app/favicon.ico  →  자동으로 /favicon.ico
```

#### `write/page.tsx`
리뷰 작성 2-step 폼. 장소/카테고리/이미지/제목/본문이 모두 채워졌는지 제출 전 검증한다.
```tsx
if (!(selectedPlace && imageFiles.length > 0 && foodCategory && title && contentRef?.current?.value)) {
  openAlert({ title: "잠시만요!", content: <>...</> });
  return;
}
writeReview({ rating, imageFiles, foodCategory, title, content, restaurant });
```

#### `review/[slug]/page.tsx`
RSC. 빌드 타임이 아닌 요청 시 서버에서 `fetch`로 단건 리뷰를 가져온다.
```tsx
async function fetchReview(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/review/${slug}`);
  if (!res.ok) return null;
  return res.json();
}
```

#### `api/auth/[...nextauth]/route.ts`
NextAuth.js v4 App Router adapter.
```ts
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### `api/review/route.ts`
`GET`: Firestore `orderBy("date","desc") + limit(5) + startAfter` 커서 페이지네이션,
작성자 정보는 uid를 `Set`으로 중복 제거해 일괄 조회(N+1 방지). `POST`: 세션 이메일로
Firestore에서 uid를 역조회한 뒤 `foodCategory`를 포함해 리뷰 문서를 생성한다.
```ts
const review = {
  uid: userUid,
  date: new Date(),
  rating: body.rating,
  images: body.images,
  foodCategory: body.foodCategory,
  title: body.title,
  content: body.content,
  restaurant: body.restaurant,
};
await setDoc(doc(collection(getFirebaseStore(), COLLECTIONS.REVIEWS)), review);
```

#### `api/review/[slug]/route.ts`
단건 리뷰 + 작성자 정보 조합 조회, `Timestamp` → `Date` 변환.
```ts
const reviewDoc = await getDoc(doc(getFirebaseStore(), COLLECTIONS.REVIEWS, slug));
const userDoc = await getDoc(doc(getFirebaseStore(), COLLECTIONS.USERS, review.uid as string));
```

#### `api/review/restaurants/route.ts`
지도 탭용 엔드포인트. 전체 리뷰를 훑어 `restaurant.placeUrl` 기준으로 중복 제거해
"업로드된 식당 목록"만 반환한다(같은 식당에 리뷰가 여러 개여도 마커는 하나).
```ts
const seen = new Set<string>();
reviewsSnapshot.docs.forEach(docItem => {
  const key = docItem.data().restaurant?.placeUrl;
  if (!key || seen.has(key)) return;
  seen.add(key);
  restaurants.push({ reviewId: docItem.id, restaurant: docItem.data().restaurant, foodCategory: docItem.data().foodCategory });
});
```

#### `api/upload-images/route.ts`
세션 검증 → 파일 MIME 타입 화이트리스트 및 5MB 용량 검증 → S3 멀티파트 업로드.
```ts
if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "..." }, { status: 400 });
const upload = new Upload({ client: s3Client, params: { Bucket, Key, Body, ContentType } });
```

#### `map/page.tsx`
지도 탭. 홈(`page.tsx`)과 동일한 SSR prefetch + `HydrationBoundary` 패턴을 그대로 재사용한다.
```tsx
export default async function MapPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: restaurantMapQueryKey, queryFn: fetchRestaurants });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllRestaurantsMap />
    </HydrationBoundary>
  );
}
```

---

## `src/components` — 렌더링 컴포넌트

#### `ReviewList.tsx`
무한 스크롤 컨테이너. 첫 2개 카드에만 `priority`를 넘겨 LCP 이미지만 프리로드하고
나머지는 지연 로딩에 맡긴다.
```tsx
{data?.map((review, idx) => (
  <ReviewItem review={review} key={review.id} priority={idx < 2} />
))}
```

#### `ReviewItem.tsx`
리뷰 카드 대표 이미지. `sizes`로 반응형 srcset을 명시하고 `priority`는 부모가 넘겨준
값을 그대로 사용한다.
```tsx
<Image src={review.images[0]} sizes="(max-width: 768px) 100vw, 768px" priority={priority} />
```

#### `RestaurantCard.tsx`
식당명/카테고리/평점/주소 + 사용자가 고른 음식 카테고리 배지. 옛날 리뷰처럼
`foodCategory`가 없는 문서는 배지 자체를 숨긴다.
```tsx
{review.foodCategory && (
  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
    {review.foodCategory}
  </span>
)}
```

#### `UserCard.tsx`
작성자 아바타 + 최근 방문일.
```tsx
<Image src={photoURL ?? DEFAULT_AVATAR} width={48} height={48} sizes="48px" />
<div>{format(date, "yyyy.MM.dd")}</div>
```

#### `ImageSwiper.tsx`
리뷰 상세의 다중 이미지 슬라이더.
```tsx
<Swiper slidesPerView={1} modules={[Navigation, Pagination]} loop navigation pagination={{ clickable: true }}>
  {images.map((img, idx) => <SwiperSlide key={idx}><Image src={img} /></SwiperSlide>)}
</Swiper>
```

#### `ImageUpload.tsx`
선택한 파일을 `resizeImage`로 리사이즈한 뒤 blob URL로 미리보기, 언마운트/변경 시
`revokeObjectURL`로 메모리를 해제한다.
```tsx
const previewUrls = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
useEffect(() => () => previewUrls.forEach(url => URL.revokeObjectURL(url)), [previewUrls]);
```

#### `WriteMap.tsx`
Kakao 키워드 장소 검색 + 마커 클러스터링.
```ts
const ps = new kakao.maps.services.Places();
ps.keywordSearch(searchText, (result, status) => {
  if (status === kakao.maps.services.Status.OK) setPlaces(mapToPlaces(result));
}, { category_group_code: ["FD6", "CE7"] });
```

#### `ReviewMap.tsx`
리뷰 상세의 단일 위치 지도. 마커 클릭 시 카카오맵 place URL을 새 탭으로 연다.
```tsx
<MapMarker position={pos} onClick={() => window.open(placeUrl, "_blank", "noopener,noreferrer")} />
```

#### `AllRestaurantsMap.tsx`
지도 탭 본체. `WriteMap`의 검색 결과 bounds-fit 패턴을 그대로 가져와, 검색 대신 "전체
식당 목록"으로 지도 범위를 자동 조정한다. 식당이 없으면 `EmptySign`을 보여준다.
```tsx
const handleCreate = (map: kakao.maps.Map) => {
  const bounds = new kakao.maps.LatLngBounds();
  restaurants.forEach(({ restaurant }) => bounds.extend(new kakao.maps.LatLng(restaurant.pos.lat, restaurant.pos.lng)));
  map.setBounds(bounds);
};
```

#### `CategorySelect.tsx`
음식 카테고리 필 버튼 그룹. `FOOD_CATEGORIES` 상수를 그대로 매핑해 선택 상태만
`clsx`로 토글한다.
```tsx
{FOOD_CATEGORIES.map(category => (
  <button key={category} onClick={() => onChange(category)} className={clsx(value === category ? "bg-blue-500 text-white" : "bg-white text-gray-700")}>
    {category}
  </button>
))}
```

#### `PlaceSearch.tsx`
장소 검색 입력 + 결과 리스트, 결과 없을 때 `EmptySign`.
```tsx
{places.length === 0 ? <EmptySign label="찾는 레스토랑이 없어요" /> : places.map(place => ...)}
```

#### `PlaceCard.tsx`
선택된 장소 요약 카드(순수 렌더링).
```tsx
<div className="text-base md:text-xl font-bold">{place.place_name}</div>
```

#### `RatingInput.tsx`
`react-star-ratings` 래핑.
```tsx
<StarRatings starRatedColor="#facc15" rating={rating} changeRating={setRating} />
```

#### `EmptySign.tsx`
빈 상태(empty state) 공용 표시.
```tsx
export default function EmptySign({ label }: { label: string }) {
  return <div className="flex flex-col items-center"><svg .../><div>{label}</div></div>;
}
```

### `src/components/shared` — 공용 UI

#### `Nav.tsx`
상단 네비게이션. 브랜드 옆에 지도 탭 링크, 로그인 상태별로 우측 메뉴가 분기된다.
```tsx
<Link href="/" className="font-aldrich text-blue-500">Aldente</Link>
<Link href="/map">지도</Link>
{status === "authenticated" ? <Link href="/write">리뷰쓰기</Link> : <button onClick={() => signIn("google")}>로그인</button>}
```

#### `Button.tsx`
시맨틱 `<button>`. `disabled`일 때 클릭이 실제로 막힌다(과거엔 `<div onClick>`이라
스타일만 바뀌고 클릭은 막히지 않았음).
```tsx
<button type="button" disabled={disabled} className={clsx(disabled ? "bg-gray-300" : "bg-blue-500")}>
  {children}
</button>
```

#### `Alert.tsx`
전역 알림 모달. Zustand store의 `open` 상태로만 렌더링 여부를 결정한다.
```tsx
"use client";
const { open, title, content, closeAlert } = useAlertStore();
if (!open) return null;
```

#### `TextField.tsx`
Enter 키를 감지해 `handleKeyDown` 콜백을 실행하는 텍스트 입력.
```tsx
const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") handleKeyDown?.();
};
```

#### `Container.tsx`
페이지 콘텐츠 `<main>` 래퍼.
```tsx
export default function Container({ children }: { children: React.ReactNode }) {
  return <main className="p-4">{children}</main>;
}
```

#### `BackButton.tsx`
```tsx
<button onClick={() => router.back()}>
  <svg viewBox="0 0 512 512" width={20} height={20}>...</svg>
</button>
```

#### `Loader.tsx`
```tsx
export default function Loader() {
  return <div className="spinner w-full mx-auto" />;
}
```

---

## `src/hooks` — 커스텀 훅

#### `useAlertStore.ts`
Zustand 전역 알림 모달 상태.
```ts
const useAlertStore = create<AlertState>((set, get) => ({
  open: false,
  openAlert: params => set({ open: true, ...params }),
  closeAlert: () => { get().onClose?.(); set({ open: false }); },
}));
```

#### `useKakaoLoader.ts`
`react-kakao-maps-sdk`의 로더를 앱 전용 라이브러리 목록으로 래핑.
```ts
export default function useKakaoLoader() {
  useKakaoLoaderOrigin({ appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "", libraries: ["clusterer", "drawing", "services"] });
}
```

---

## `src/queries` — 데이터 페칭 훅 (TanStack Query)

#### `useReviewList.ts`
`fetchReviewList`/`reviewQueryKey`를 export해 `page.tsx`의 서버 prefetch와 공유한다.
서버에서는 절대 URL, 클라이언트에서는 상대 경로로 분기한다.
```ts
const baseUrl = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000") : "";
const response = await fetch(`${baseUrl}/api/review${pageParam ? `?lastVisible=${pageParam}` : ""}`);
```

#### `useWriteReview.ts`
이미지 업로드 후 리뷰 생성을 순차 실행하는 뮤테이션.
```ts
const submitReview = async (review: SubmitReview) => {
  const imageUrls = await uploadImagesToS3(review.imageFiles);
  return fetch("/api/review", { method: "POST", body: JSON.stringify({ ...review, images: imageUrls }) });
};
```

#### `useRestaurantMap.ts`
`useReviewList.ts`와 동일한 base URL 분기 패턴을 따르는 지도 탭용 쿼리. 무한스크롤이
아니라 한 번에 전체를 가져오므로 `useSuspenseQuery`(non-infinite)를 쓴다.
```ts
export async function fetchRestaurants(): Promise<RestaurantMapItem[]> {
  const baseUrl = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000") : "";
  const response = await fetch(`${baseUrl}/api/review/restaurants`);
  return response.json();
}
```

---

## `src/utils` — 외부 클라이언트/유틸

#### `firebase.ts`
`getApps()/getApp()` 기반 lazy singleton 초기화(HMR/서버리스 재초기화 방지).
```ts
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}
```

#### `authOptions.ts`
`signIn` 콜백에서 NextAuth의 id_token을 Firebase credential로 교환한 뒤 Firestore
`users`에 upsert한다.
```ts
const googleCredential = GoogleAuthProvider.credential(account?.id_token);
const userCredential = await signInWithCredential(getFirebaseAuth(), googleCredential);
await setDoc(userRef, { uid, email, displayName, photoURL, lastLogin: new Date().toISOString() }, { merge: true });
```

#### `s3.ts`
```ts
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});
```

#### `resizeImage.ts`
업로드 전 Canvas API로 최대 1200px, JPEG 품질 0.85로 리사이즈. GIF는 애니메이션 손실을
피하려고 건너뛴다.
```ts
if (file.type === "image/gif") return file;
canvas.width = newWidth; canvas.height = newHeight;
ctx.drawImage(img, 0, 0, newWidth, newHeight);
canvas.toBlob(blob => resolve(new File([blob], newName, { type: "image/jpeg" })), "image/jpeg", 0.85);
```

---

## `src/models` — 타입 정의

#### `review.ts`
`Review` 인터페이스 + 지도 탭에서 쓰는 파생 타입 `RestaurantMapItem`.
```ts
export interface Review {
  foodCategory: FoodCategory;
  restaurant: { name: string; pos: { lat: number; lng: number }; placeUrl: string; /* ... */ };
}
export interface RestaurantMapItem {
  reviewId: string;
  restaurant: Review["restaurant"];
  foodCategory: Review["foodCategory"];
}
```

#### `user.ts`
```ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: string;
}
```

#### `place.ts`
Kakao Places API 응답 형태.
```ts
export interface Place {
  place_name: string;
  category_name: string;
  pos: { lat: number; lng: number };
  place_url: string;
}
```

---

## `src/constants`

#### `collections.ts`
Firestore 컬렉션명 상수 — 오타로 인한 컬렉션명 불일치 방지.
```ts
export const COLLECTIONS = { USERS: "users", REVIEWS: "reviews" };
```

#### `foodCategories.ts`
리뷰 음식 카테고리 고정 목록. `as const`로 리터럴 유니온 타입을 파생시켜 `CategorySelect`,
`Review.foodCategory`가 같은 타입을 공유한다.
```ts
export const FOOD_CATEGORIES = ["한식", "중식", "일식", "양식", "카페", "분식", "디저트", "술집", "기타"] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
```

---

## `src/context`

#### `ClientProvider.tsx`
`useState`로 `QueryClient`를 지연 생성해 SSR 요청 간 상태가 섞이지 않게 격리한다.
```tsx
const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } } }));
```

---

## 루트 레벨 특수 파일

#### `src/proxy.ts`
Next.js 16의 Proxy(구 Middleware) 컨벤션. `/write`만 보호하며, HTML 요청은 홈으로
리다이렉트하고 그 외(API 등)는 401 JSON을 반환한다.
```ts
const protectedRoutes = ["/write"];
export async function proxy(req: NextRequest) {
  if (protectedRoutes.some(path => req.nextUrl.pathname.startsWith(path))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/write"] };
```

---

## 참고

- 스타일 관련 전역 규칙, 폴더 구조 원칙, 알려진 이슈는 [CLAUDE.md](./CLAUDE.md) 참고.
- 패키지별 도입 이유·설정 파일 상세 해설은 [PROJECT.md](./PROJECT.md) 참고.
