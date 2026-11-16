import { CATEGORY_INFO, COLOR_INFO, type Category, type ColorFamily, type ReportType } from "@lf/shared";
import { cx } from "@/utils/cx";

/** The item's category icon on a soft tile, with a dot showing its colour family. */
export function ItemTile({
  type,
  category,
  colorFamily,
  size = "md",
}: {
  type: ReportType;
  category: Category;
  colorFamily: ColorFamily;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cx(
        "relative grid shrink-0 place-items-center rounded-xl",
        type === "LOST" ? "bg-rose-50" : "bg-accent-50",
        size === "md" ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg",
      )}
      aria-hidden
    >
      {CATEGORY_INFO[category].icon}
      {colorFamily !== "UNKNOWN" && (
        <span
          className={cx(
            "absolute -bottom-1 -right-1 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)] ring-2 ring-white",
            size === "md" ? "h-4 w-4" : "h-3 w-3",
          )}
          style={{ background: COLOR_INFO[colorFamily].swatch }}
          title={COLOR_INFO[colorFamily].label}
        />
      )}
    </div>
  );
}
