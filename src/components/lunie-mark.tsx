import { PART_0 } from "@/components/wordmark/part-0";
import { PART_1 } from "@/components/wordmark/part-1";
import { PART_2 } from "@/components/wordmark/part-2";
import { PART_3 } from "@/components/wordmark/part-3";
import { PART_4 } from "@/components/wordmark/part-4";
import { PART_5 } from "@/components/wordmark/part-5";
import { cn } from "@/lib/utils";

const WORDMARK = `data:image/png;base64,${PART_0}${PART_1}${PART_2}${PART_3}${PART_4}${PART_5}`;

export function LunieMark({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="LUNIE"
      className={cn("h-11 w-40 bg-primary sm:h-14 sm:w-52", className)}
      style={{
        maskImage: `url("${WORDMARK}")`,
        WebkitMaskImage: `url("${WORDMARK}")`,
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
