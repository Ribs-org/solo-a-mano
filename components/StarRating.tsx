"use client";

export default function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <svg key={n} viewBox="0 0 24 24" data-testid={`star-${n}`} data-filled={filled}
            className={`h-5 w-5 ${filled ? "fill-ambar" : "fill-beige"}`} aria-hidden>
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        );
        if (!onChange) return star;
        return (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} estrellas`}>
            {star}
          </button>
        );
      })}
    </span>
  );
}
