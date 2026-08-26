"use client";

import { useEffect, useState } from "react";

export type HeroSlide = {
  imageUrl?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
};

export function HeroCarousel({ slides, intervalMs = 5000 }: Props) {
  const safe = slides.filter(
    (s) =>
      s.imageUrl ||
      s.heading ||
      s.description ||
      s.ctaLabel,
  );
  const list = safe.length > 0 ? safe : [{ heading: "Add a slide" }];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.length]);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, Math.max(2500, intervalMs));
    return () => window.clearInterval(id);
  }, [list.length, intervalMs]);

  const slide = list[index] ?? list[0]!;

  return (
    <div className="relative min-h-[22rem] overflow-hidden sm:min-h-[28rem]">
      {list.map((s, i) => (
        <div
          key={i}
          className={[
            "absolute inset-0 bg-cover bg-center transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={
            s.imageUrl
              ? { backgroundImage: `url(${s.imageUrl})` }
              : { background: "#18181b" }
          }
          aria-hidden={i !== index}
        />
      ))}
      <div className="absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[22rem] max-w-3xl flex-col justify-center px-6 py-16 text-center text-white sm:min-h-[28rem]">
        {slide.heading ? (
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {slide.heading}
          </h1>
        ) : null}
        {slide.description ? (
          <p className="mt-4 text-lg text-white/90">{slide.description}</p>
        ) : null}
        {slide.ctaLabel ? (
          <div className="mt-8">
            <a
              href={slide.ctaHref || "#"}
              className="inline-flex rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              {slide.ctaLabel}
            </a>
          </div>
        ) : null}
      </div>

      {list.length > 1 ? (
        <>
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={[
                  "h-2.5 w-2.5 cursor-pointer rounded-full",
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setIndex((i) => (i - 1 + list.length) % list.length)
            }
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 px-3 py-2 text-sm text-white hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % list.length)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 px-3 py-2 text-sm text-white hover:bg-black/60"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
