"use client";

import * as React from "react";

type ComplaintShareButtonProps = {
  className?: string;
  label?: string;
};

async function copyText(
  value: string,
): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(
      value,
    );

    return;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  const wasCopied =
    document.execCommand("copy");

  textarea.remove();

  if (!wasCopied) {
    throw new Error(
      "Не удалось скопировать ссылку.",
    );
  }
}

export default function ComplaintShareButton({
  className = "",
  label = "Скопировать ссылку",
}: ComplaintShareButtonProps) {
  const [state, setState] =
    React.useState<
      "idle" | "copied" | "error"
    >("idle");

  const timeoutRef =
    React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(
          timeoutRef.current,
        );
      }
    };
  }, []);

  async function handleCopy(): Promise<void> {
    try {
      await copyText(window.location.href);
      setState("copied");
    } catch (error) {
      console.error(
        "Complaint link copying error:",
        error,
      );

      setState("error");
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(
        timeoutRef.current,
      );
    }

    timeoutRef.current =
      window.setTimeout(() => {
        setState("idle");
      }, 2200);
  }

  return (
    <button
      className={className}
      onClick={() => {
        void handleCopy();
      }}
      type="button"
    >
      {state === "copied"
        ? "Ссылка скопирована"
        : state === "error"
          ? "Не удалось скопировать"
          : label}
    </button>
  );
}