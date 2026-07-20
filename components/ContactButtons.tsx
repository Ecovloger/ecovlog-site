"use client";

import { useState } from "react";

type ContactButtonsProps = {
  youtube?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
  email?: string;
  phone?: string;
};

export default function ContactButtons({
  youtube,
  instagram,
  tiktok,
  telegram,
  email,
  phone,
}: ContactButtonsProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleEmail() {
    if (!email) {
      return;
    }

    if (!showEmail) {
      setShowEmail(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(email);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  const socials = [
    {
      name: "YouTube",
      label: "YouTube",
      link: youtube,
      icon: "/icons/youtube.svg",
    },
    {
      name: "Instagram",
      label: "Instagram*",
      link: instagram,
      icon: "/icons/instagram.svg",
    },
    {
      name: "TikTok",
      label: "TikTok",
      link: tiktok,
      icon: "/icons/tiktok.svg",
    },
    {
      name: "Telegram",
      label: "Telegram",
      link: telegram,
      icon: "/icons/telegram.svg",
    },
  ];

  return (
    <div className="mt-8 space-y-4">
      {socials.map(
        (item) =>
          item.link && (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-white/20
                bg-white/10
                px-6
                py-4
                backdrop-blur-xl
                transition
                hover:bg-white/20
              "
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="
                  h-6
                  w-6
                  object-contain
                "
              />

              <span>{item.label}</span>
            </a>
          ),
      )}

      {email && (
        <button
          type="button"
          onClick={handleEmail}
          className="
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            border
            border-white/20
            bg-white/10
            px-6
            py-4
            text-left
            backdrop-blur-xl
            transition
            hover:bg-white/20
          "
        >
          <img
            src="/icons/email.svg"
            alt=""
            aria-hidden="true"
            className="
              h-6
              w-6
              object-contain
            "
          />

          <span>
            {copied
              ? "Скопировано"
              : showEmail
                ? email
                : "Email"}
          </span>
        </button>
      )}

      {phone && (
        <div
          className="
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-white/20
            bg-white/10
            px-6
            py-4
            backdrop-blur-xl
          "
        >
          <span aria-hidden="true">☎</span>

          <span>{phone}</span>
        </div>
      )}
    </div>
  );
}