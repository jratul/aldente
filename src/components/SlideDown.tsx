import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  open: boolean;
}

export default function SlideDown({ children, open }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>("0px");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setHeight(`${contentRef.current?.scrollHeight}px`);
        // setHeight("auto");
      });
    } else {
      requestAnimationFrame(() => {
        setHeight("0px");
      });
    }
  }, [open]);

  return (
    <div
      className={clsx("transition-all duration-500 overflow-hidden")}
      style={{ height }}
      ref={contentRef}
    >
      {children}
    </div>
  );
}
