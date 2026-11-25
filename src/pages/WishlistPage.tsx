import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, Gift, RefreshCw } from "lucide-react";
import { api, friendlyError } from "../lib/api";
import type { Wishlist } from "../types";

export default function WishlistPage() {
  const [items, setItems] = useState<Wishlist[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const data = await api.list(); setItems(data.items); }
    catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => items.filter(item =>
    `${item.name} ${item.gift} ${item.notes ?? ""}`.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"))
  ), [items, query]);

  return (
    <section className="content-page">
      <div className="page-intro">
        <div className="eyebrow">MIKOŁAJKI SZKOLNE</div>
        <h1>Lista życzeń</h1>
        <p>Prezenty zgłoszone przez uczestników.</p>
      </div>
      <div className="list-toolbar">
        <div className="search-box"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj osoby lub prezentu..." /></div>
        <button className="icon-button" onClick={() => void load()} aria-label="Odśwież listę"><RefreshCw size={17} /></button>
      </div>
      {loading ? <div className="empty-state">Ładowanie listy życzeń...</div> :
       error ? <div className="empty-state error">{error}<button className="button secondary" onClick={() => void load()}>Spróbuj ponownie</button></div> :
       filtered.length === 0 ? <div className="empty-state"><Gift size={30} /><b>Brak wpisów</b><span>{query ? "Nie znaleziono wyników." : "Lista jest jeszcze pusta."}</span></div> :
       <div className="wishlist-grid">{filtered.map(item => (
        <article className="wish-card" key={item.id}>
          <div className="wish-top"><span className="gift-bubble"><Gift size={18} /></span><span className="wish-date">{new Date(item.created_at).toLocaleDateString("pl-PL")}</span></div>
          <span className="wish-person">{item.name}</span>
          <h3>{item.gift}</h3>
          {item.notes && <p>{item.notes}</p>}
          {item.url && <a className="product-link" href={item.url} target="_blank" rel="noreferrer">Zobacz prezent <ExternalLink size={14} /></a>}
        </article>
       ))}</div>}
      <p className="privacy-note">Widoczne są tylko wpisy. Prywatne linki do edycji nie są publikowane.</p>
    </section>
  );
}