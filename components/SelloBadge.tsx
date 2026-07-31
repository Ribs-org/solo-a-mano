import type { VerificationStatus } from "@/lib/types";

export default function SelloBadge({ status, size = "sm" }: { status: VerificationStatus; size?: "sm" | "lg" }) {
  if (status !== "verificado") return null;
  const cls = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-terracota font-medium text-crema ${cls}`}
      title="Emprendimiento verificado: vende únicamente productos hechos a mano">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M12 2l2.4 2.4 3.4-.5.5 3.4L20.7 9l-1.6 3 1.6 3-2.4 1.7-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4L3.3 15l1.6-3-1.6-3 2.4-1.7.5-3.4 3.4.5L12 2zm-1.2 13l5-5-1.4-1.4-3.6 3.6-1.6-1.6L7.8 12l3 3z" />
      </svg>
      Sello Sólo A Mano
    </span>
  );
}
