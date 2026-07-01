"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({
  className,
  width = 128,
  height = 128,
  priority,
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Remit"
      width={width}
      height={height}
      priority={priority}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className={cn("pointer-events-none object-contain select-none", className)}
    />
  );
}
