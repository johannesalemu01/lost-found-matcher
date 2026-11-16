import { LOCATIONS, NOT_SURE, type ReportType } from "@lf/shared";
import type { StepProps } from "@/interfaces";
import { toLocalInput } from "@/utils/format";
import { timePresets } from "@/utils/time-presets";
import { Chip, FieldError } from "@/components/ui";

/** Step 2 – "Where & when?": places (multi-select or Not sure), time window / moment, private detail. */
export function PlaceTimeStep({ form, errors, isLost, set, update, type }: StepProps & { type: ReportType }) {
  const toggleLocation = (id: string) =>
    set(
      "locations",
      form.locations.includes(id) ? form.locations.filter((x) => x !== id) : [...form.locations.filter((x) => x !== NOT_SURE), id],
    );

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">
          {isLost ? "Where might you have lost it? Pick all that apply." : "Where did you find it?"}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <Chip key={l.id} selected={form.locations.includes(l.id)} onClick={() => toggleLocation(l.id)}>
              {l.label}
            </Chip>
          ))}
          <Chip
            selected={form.locations.includes(NOT_SURE)}
            onClick={() => set("locations", form.locations.includes(NOT_SURE) ? [] : [NOT_SURE])}
          >
            🤷 Not sure
          </Chip>
        </div>
        <FieldError message={errors.locations} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">{isLost ? "When? Give a window – between…" : "When did you find it?"}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {timePresets(type).map((p) => (
            <Chip
              key={p.label}
              selected={false}
              onClick={() => {
                const [s, e] = p.range();
                update({ start: toLocalInput(s), end: toLocalInput(e) }, ["eventStart", "eventEnd"]);
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="start" className="text-xs text-stone-500">
              {isLost ? "Between" : "Date and time"}
            </label>
            <input
              id="start"
              type="datetime-local"
              className="mt-1 w-full"
              value={form.start}
              max={toLocalInput(new Date())}
              onChange={(e) => update({ start: e.target.value }, ["eventStart"])}
            />
            <FieldError message={errors.eventStart} />
          </div>
          {isLost && (
            <div>
              <label htmlFor="end" className="text-xs text-stone-500">
                and
              </label>
              <input
                id="end"
                type="datetime-local"
                className="mt-1 w-full"
                value={form.end}
                max={toLocalInput(new Date())}
                onChange={(e) => update({ end: e.target.value }, ["eventEnd"])}
              />
              <FieldError message={errors.eventEnd} />
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-stone-500">Times are in your local time zone.</p>
      </fieldset>

      <div>
        <label htmlFor="private">{isLost ? "Something only you would know" : "A hidden identifying detail"}</label>
        <p className="mt-0.5 text-xs text-stone-500">
          {isLost
            ? "An engraving, your wallpaper, what’s inside… "
            : "Something you noticed but left out of the public description – a sticker, a name, contents… "}
          <strong className="font-medium text-stone-700">Only staff see this</strong>, so nobody can falsely claim the item by
          copying the public listing.
        </p>
        <textarea
          id="private"
          rows={2}
          maxLength={300}
          className="mt-1.5 w-full"
          placeholder={isLost ? "e.g. my name is engraved inside the lid" : "e.g. cat sticker on the back"}
          value={form.privateDetail}
          onChange={(e) => set("privateDetail", e.target.value)}
        />
        <FieldError message={errors.privateDetail} />
      </div>
    </div>
  );
}
