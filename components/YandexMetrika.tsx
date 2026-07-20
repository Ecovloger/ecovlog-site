"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const COUNTER_ID = 110893016;

declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...parameters: unknown[]
    ) => void;

    __yandexMetrikaInitialized?: boolean;
  }
}

function YandexMetrikaPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef<string | null>(null);

  const search = searchParams.toString();

  useEffect(() => {
    const url = search ? `${pathname}?${search}` : pathname;
    const fullUrl = `${window.location.origin}${url}`;

    let attempts = 0;

    const sendPageView = () => {
      if (
        typeof window.ym === "function" &&
        window.__yandexMetrikaInitialized
      ) {
        window.ym(COUNTER_ID, "hit", fullUrl, {
          title: document.title,
          referer: previousUrl.current ?? document.referrer,
        });

        previousUrl.current = fullUrl;
        return;
      }

      attempts += 1;

      if (attempts < 50) {
        window.setTimeout(sendPageView, 100);
      }
    };

    sendPageView();
  }, [pathname, search]);

  return null;
}

export default function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){
              (m[i].a=m[i].a||[]).push(arguments)
            };

            m[i].l=1*new Date();

            for(var j=0;j<document.scripts.length;j++){
              if(document.scripts[j].src===r){
                return;
              }
            }

            k=e.createElement(t);
            a=e.getElementsByTagName(t)[0];
            k.async=1;
            k.src=r;
            a.parentNode.insertBefore(k,a);
          })(
            window,
            document,
            "script",
            "https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}",
            "ym"
          );

          ym(${COUNTER_ID}, "init", {
            ssr: true,
            defer: true,
            webvisor: true,
            clickmap: true,
            accurateTrackBounce: true,
            trackLinks: true
          });

          window.__yandexMetrikaInitialized = true;
        `}
      </Script>

      <Suspense fallback={null}>
        <YandexMetrikaPageTracker />
      </Suspense>

      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
            style={{
              position: "absolute",
              left: "-9999px",
            }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}