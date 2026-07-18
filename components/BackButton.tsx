"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        flex
        items-center
        gap-2

        rounded-full

        bg-white/10
        backdrop-blur-2xl

        border
        border-white/20

        px-5
        py-2.5

        text-white
        font-medium

        shadow-[0_8px_30px_rgba(255,255,255,0.08)]

        hover:bg-white/20
        hover:scale-105

        transition
        duration-300
      "
    >
      <span className="text-lg">←</span>
      <span>Назад</span>
    </button>
  );
}