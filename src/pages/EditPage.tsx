import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Save } from "lucide-react";
import Field from "../components/Field";
import { api, friendlyError } from "../lib/api";

export default function EditPage() {
  const { token = "" } = useParams();
  const [name, setName] = useState("");
  const [gift, setGift] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      await api.edit({ token, name: name.trim(), gift: gift.trim(), url: url.trim(), notes: notes.trim() });
      setMessage("Zapisano zmiany.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setLoading(false); }
  }

  return <section className="narrow-page">
    <div className="page-intro"><div className="eyebrow">MIKOŁAJKI SZKOLNE</div><h1>Edytuj wpis</h1><p>Zmień dane i zapisz formularz.</p></div>
    <div className="form-card standalone">
      <form onSubmit={submit}>
        <Field label="Imię" value={name} onChange={setName} required />
        <Field label="Prezent" value={gift} onChange={setGift} required />
        <Field label="Link do prezentu" value={url} onChange={setUrl} type="url" />
        <Field label="Dodatkowe informacje" value={notes} onChange={setNotes} multiline />
        {error && <p className="error">{error}</p>}
        {message && <p className="success-message"><CheckCircle2 size={17} />{message}</p>}
        <button className="button full" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz zmiany"} <Save size={16} /></button>
      </form>
    </div>
  </section>;
}