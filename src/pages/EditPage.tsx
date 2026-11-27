import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Save, Trash2 } from "lucide-react";
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
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      await api.edit({ token, name: name.trim(), gift: gift.trim(), url: url.trim(), notes: notes.trim() });
      setMessage("Zapisano zmiany.");
    } catch (err) { setError(friendlyError(err)); }
    finally { setLoading(false); }
  }

  async function hideOwnEntry() {
    if (!window.confirm("Usunąć swój wpis z publicznej listy? Administrator będzie mógł go przywrócić.")) return;
    setLoading(true); setError(""); setMessage("");
    try { await api.hideOwn(token); setHidden(true); }
    catch (err) { setError(friendlyError(err)); }
    finally { setLoading(false); }
  }

  return <section className="narrow-page">
    <div className="page-intro"><div className="eyebrow">MIKOŁAJKI SZKOLNE</div><h1>Edytuj wpis</h1><p>Zmień dane i zapisz formularz.</p></div>
    <div className="form-card standalone">
      {hidden ? <div className="success-panel"><CheckCircle2 size={34} /><h3>Wpis ukryty</h3><p>Twój wpis nie jest już widoczny na publicznej liście. Administrator może go przywrócić.</p></div> : <form onSubmit={submit}>
        <Field label="Imię" value={name} onChange={setName} required />
        <Field label="Prezent" value={gift} onChange={setGift} required />
        <Field label="Link do prezentu" value={url} onChange={setUrl} type="url" />
        <Field label="Dodatkowe informacje" value={notes} onChange={setNotes} multiline />
        {error && <p className="error">{error}</p>}
        {message && <p className="success-message"><CheckCircle2 size={17} />{message}</p>}
        <button className="button full" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz zmiany"} <Save size={16} /></button>
        <button type="button" className="button secondary full" disabled={loading} onClick={() => void hideOwnEntry()}><Trash2 size={16} /> Usuń mój wpis z listy</button>
      </form>
    </div>
  </section>;
}