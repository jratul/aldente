"use client";

import Button from "@components/shared/Button";
import { useRouter } from "next/navigation";

interface Props {
  reset: () => void;
}

export default function ErrorPage({ reset }: Props) {
  const router = useRouter();
  const handleButtonClick = () => {
    reset();
    router.back();
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-[100px]">
      <div className="font-bold">잘못된 주문이에요</div>
      <div className="w-40">
        <Button handleClick={handleButtonClick}>돌아가기</Button>
      </div>
    </div>
  );
}
