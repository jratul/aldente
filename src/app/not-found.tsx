"use client";

import Button from "@components/shared/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const handleButtonClick = () => {
    router.back();
  };
  return (
    <div className="flex flex-col items-center mt-[100px] gap-2">
      <div className="font-bold">없는 메뉴를 주문했어요</div>
      <Image src="/blank.webp" alt="blank" width={400} height={400} />
      <Button handleClick={handleButtonClick}>돌아가기</Button>
    </div>
  );
}
