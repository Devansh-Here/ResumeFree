import { ROLE_OPTIONS } from "../../utils/atsCheck";

export default function RoleSelector({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-2">
      <label htmlFor="resume-checker-role" className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
        Target role
      </label>
      <select
        id="resume-checker-role"
        value={value || ""}
        onChange={(event) => onChange(event.target.value || null)}
        disabled={disabled}
        className="w-full appearance-none border border-mist bg-paper-white px-4 py-2.5 font-body text-[14px] text-graphite-ink outline-none transition-all duration-150 focus:border-iris-violet focus:ring-2 focus:ring-iris-violet rounded-inputs disabled:cursor-not-allowed disabled:bg-soft-snow disabled:text-fog"
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.key || "auto"} value={option.key || ""}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="font-body text-[12px] leading-relaxed text-fog">
        Choose a role for a more focused keyword report, or let the scanner detect one.
      </p>
    </div>
  );
}
