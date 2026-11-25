type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
};
export default function Field({ label, value, onChange, placeholder, required, multiline, type = "text" }: Props) {
  return (
    <label className="field">
      <span>{label}{required && <i> *</i>}</span>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
      )}
    </label>
  );
}