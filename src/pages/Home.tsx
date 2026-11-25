import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Gift, Snowflake } from "lucide-react";
import Field from "../components/Field";
import { api, friendlyError } from "../lib/api";

export default function Home() {
  const [name, setName] = useState("");
  const [gift, setGift] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUrl, setEditUrl] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.create({ name: name.trim(), gift: gift.trim(), url: url.trim(), notes: notes.trim() });
      setEditUrl(`${window.location.origin}/Edytuj/${result.token}`);
      setName(""); setGift(""); setUrl(""); setNotes("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <h1>Mikołajki<br />szkolne</h1>
        <p className="lead">Dodaj prezent, który chcesz dostać. Możesz też podać link i dodatkowe informacje.</p>
        <div className="hero-links">
          <Link className="text-link" to="/Lista">Zobacz listę <ArrowRight size={16} /></Link>
        </div>
      </div>
      <div className="form-card">
        <div className="card-heading">
          <div className="heading-icon"><Gift size={21} /></div>
          <div><span className="overline">LISTA PREZENTÓW</span><h2>Dodaj prezent</h2></div>
        </div>
        {editUrl ? (
          <div className="success-panel">
            <CheckCircle2 size={34} />
            <h3>Dodano</h3>
            <p>Zapisz ten link, aby później edytować swój wpis.</p>
            <div className="copy-row"><input readOnly value={editUrl} /><button onClick={() => navigator.clipboard.writeText(editUrl)}>Kopiuj</button></div>
            <button className="button secondary full" onClick={() => setEditUrl("")}>Dodaj kolejne życzenie</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <Field label="Jak masz na imię?" value={name} onChange={setName} placeholder="Np. Kasia" required />
            <Field label="Jaki prezent Ci się marzy?" value={gift} onChange={setGift} placeholder="Np. zestaw kredek" required />
            <Field label="Link do prezentu (opcjonalnie)" value={url} onChange={setUrl} placeholder="https://..." type="url" />
            <Field label="Dodatkowe informacje (opcjonalnie)" value={notes} onChange={setNotes} placeholder="Kolor, rozmiar lub inne wskazówki..." multiline />
            {error && <p className="error">{error}</p>}
            <button className="button full" disabled={loading}>{loading ? "Dodawanie..." : "Dodaj prezent"} <ArrowRight size={17} /></button>
            <p className="form-footnote">Po dodaniu otrzymasz prywatny link do edycji.</p>
          </form>
        )}
      </div>
    </section>
  );
}