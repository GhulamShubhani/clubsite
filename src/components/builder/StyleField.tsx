"use client";

type Option = { value: string; label: string };

const SELECT_OPTIONS: Record<string, Option[]> = {
  textAlign: [
    { value: "", label: "Default" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
  ],
  alignment: [
    { value: "", label: "Default" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ],
  fontWeight: [
    { value: "", label: "Default" },
    { value: "300", label: "Light" },
    { value: "400", label: "Normal" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semibold" },
    { value: "700", label: "Bold" },
    { value: "800", label: "Extra bold" },
  ],
  fontSize: [
    { value: "", label: "Default" },
    { value: "12px", label: "12px — Small" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px — Body" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px — Heading" },
    { value: "32px", label: "32px" },
    { value: "40px", label: "40px" },
    { value: "48px", label: "48px — Large" },
  ],
  fontFamily: [
    { value: "", label: "Default" },
    { value: "system-ui, sans-serif", label: "System sans" },
    { value: "Georgia, serif", label: "Serif" },
    { value: "ui-monospace, monospace", label: "Mono" },
    { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "Verdana, sans-serif", label: "Verdana" },
  ],
  lineHeight: [
    { value: "", label: "Default" },
    { value: "1", label: "Tight (1)" },
    { value: "1.25", label: "Snug (1.25)" },
    { value: "1.5", label: "Normal (1.5)" },
    { value: "1.75", label: "Relaxed (1.75)" },
    { value: "2", label: "Loose (2)" },
  ],
  borderRadius: [
    { value: "", label: "Default" },
    { value: "0", label: "None" },
    { value: "4px", label: "Small (4px)" },
    { value: "8px", label: "Medium (8px)" },
    { value: "12px", label: "Large (12px)" },
    { value: "16px", label: "XL (16px)" },
    { value: "9999px", label: "Pill" },
  ],
  padding: [
    { value: "", label: "Default" },
    { value: "0", label: "None" },
    { value: "8px", label: "8px" },
    { value: "12px", label: "12px" },
    { value: "16px", label: "16px" },
    { value: "24px", label: "24px" },
    { value: "32px", label: "32px" },
    { value: "48px", label: "48px" },
    { value: "16px 24px", label: "16px 24px" },
    { value: "24px 32px", label: "24px 32px" },
  ],
  margin: [
    { value: "", label: "Default" },
    { value: "0", label: "None" },
    { value: "8px", label: "8px" },
    { value: "16px", label: "16px" },
    { value: "24px", label: "24px" },
    { value: "32px", label: "32px" },
    { value: "0 auto", label: "Center (0 auto)" },
  ],
  width: [
    { value: "", label: "Default" },
    { value: "100%", label: "Full (100%)" },
    { value: "auto", label: "Auto" },
    { value: "50%", label: "Half (50%)" },
    { value: "320px", label: "320px" },
    { value: "480px", label: "480px" },
    { value: "640px", label: "640px" },
    { value: "768px", label: "768px" },
  ],
  height: [
    { value: "", label: "Default" },
    { value: "auto", label: "Auto" },
    { value: "48px", label: "48px" },
    { value: "64px", label: "64px" },
    { value: "200px", label: "200px" },
    { value: "320px", label: "320px" },
    { value: "400px", label: "400px" },
    { value: "100vh", label: "Full screen" },
  ],
  background: [
    { value: "", label: "Default" },
    { value: "transparent", label: "Transparent" },
    { value: "#ffffff", label: "White" },
    { value: "#f4f4f5", label: "Zinc 100" },
    { value: "#18181b", label: "Near black" },
    { value: "#22c55e", label: "Green" },
    { value: "#0ea5e9", label: "Sky" },
  ],
  color: [
    { value: "", label: "Default" },
    { value: "#18181b", label: "Near black" },
    { value: "#52525b", label: "Zinc 600" },
    { value: "#ffffff", label: "White" },
    { value: "#22c55e", label: "Green" },
    { value: "#0ea5e9", label: "Sky" },
  ],
  border: [
    { value: "", label: "Default" },
    { value: "none", label: "None" },
    { value: "1px solid #e4e4e7", label: "Light" },
    { value: "1px solid #a1a1aa", label: "Medium" },
    { value: "2px solid #18181b", label: "Strong" },
  ],
  boxShadow: [
    { value: "", label: "Default" },
    { value: "none", label: "None" },
    { value: "0 1px 2px rgba(0,0,0,0.08)", label: "Soft" },
    { value: "0 4px 12px rgba(0,0,0,0.12)", label: "Medium" },
    { value: "0 10px 30px rgba(0,0,0,0.18)", label: "Large" },
  ],
};

type StyleFieldProps = {
  fieldKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function StyleField({
  fieldKey,
  label,
  value,
  onChange,
  className = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm",
}: StyleFieldProps) {
  const options = SELECT_OPTIONS[fieldKey];
  const known = options?.some((o) => o.value === value) ?? false;

  if (options) {
    return (
      <label className="mb-2 block">
        <span className="text-xs text-zinc-500">{label}</span>
        <select
          className={`${className} cursor-pointer`}
          value={known ? value : value ? `__custom__` : ""}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "__custom__") return;
            onChange(next);
          }}
        >
          {options.map((o) => (
            <option key={o.value || "default"} value={o.value}>
              {o.label}
            </option>
          ))}
          {value && !known ? (
            <option value="__custom__">Custom: {value}</option>
          ) : null}
        </select>
        {value && !known ? (
          <input
            className={`${className} mt-1 font-mono`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Custom value"
          />
        ) : null}
      </label>
    );
  }

  return (
    <label className="mb-2 block">
      <span className="text-xs text-zinc-500">{label}</span>
      <input
        className={`${className} font-mono`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
