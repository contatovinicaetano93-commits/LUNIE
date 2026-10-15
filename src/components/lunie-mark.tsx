import { cn } from "@/lib/utils";

export function LunieMark({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="LUNIE"
      className={cn("h-11 w-40 bg-primary sm:h-14 sm:w-52", className)}
      style={{
        maskImage: "url(/lunie-wordmark.svg)",
        WebkitMaskImage: "url(/lunie-wordmark.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
