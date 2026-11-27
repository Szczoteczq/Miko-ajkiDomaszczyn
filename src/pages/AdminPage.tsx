import { useState } from "react";
import { Check, LockKeyhole, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import Field from "../components/Field";
import { api, friendlyError } from "../lib/api";
import type { Wishlist } from "../types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<Wishlist[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Wishlist | null>(null);
  const [busy, setBusy] = useState(false);

  async function admin(payload: Record<string, unknown>) {
    setBusy(true); setError("");
    try { return await api.admin({ password, ...payload }); }
    catch (e) { setError(friendlyError(e)); throw e; }
    finally { setBusy(false); }
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    try { const result = await admin({ action: "list" }); setItems(result.items ?? []); setAuthenticated(true); }
    catch { setAuthenticated(false); }
  }
  async function refresh() {
    try { const result = await admin({ action: "list" }); setItems(result.items ?? []); }
    catch { setAuthenticated(false); }
  }
  async function toggleHidden(item: Wishlist) {
    const action = item.hidden_at ? "restore" : "hide";
    const prompt = item.hidden_at
      ? `Przywrócić wpis użytkownika ${item.name} na publiczną listę?`
      : `Ukryć wpis użytkownika ${item.name}? Możesz go później przywrócić.`;
    if (!window.confirm(prompt)) return;
    try { await admin({ action, id: item.id }); await refresh(); }
    catch {}
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editing) return;
    try {
      await admin({ action: "update", id: editing.id, name: editing.name, gift: editing.gift, url: editing.url ?? "", notes: editing.notes ?? "" });
      setEditing(null); await refresh();
    } catch {}
  }
  const filtered = items.filter(i => `${i.name} ${i.gift}`.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl")));

  if (!authenticated) return <section className="narrow-page">
    <div className="page-intro"><div className="eyebrow">MIKOŁAJKI SZKOLNE</div><h1>Panel administratora</h1><p>Zaloguj się, aby zarządzać wpisami.</p></div>
    <div className="form-card standalone"><form onSubmit={login}>
      <div className="admin-lock"><LockKeyhole size={25} /></div>
      <Field label="Hasło administratora" value={password} onChange={setPassword} type="password" required />
      {error && <p className="error">{error}</p>}
      <button className="button full" disabled={busy}>{busy ? "Sprawdzanie..." : "Zaloguj się"}</button>
    </form></div>
  </section>;

  return <section className="content-page">
    <div className="admin-heading"><div><div className="eyebrow">ZARZĄDZANIE WPISAMI</div><h1>Panel administratora</h1></div><button className="icon-button" onClick={() => void refresh()}><RefreshCw size={17} /></button></div>
    <div className="admin-stats"><b>{items.length}</b><span>wpisów (w tym ukryte)</span></div>
    <div className="list-toolbar"><div className="search-box"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj..." /></div><button className="button secondary" onClick={() => { setAuthenticated(false); setPassword(""); }}>Wyloguj</button></div>
    {error && <p className="error">{error}</p>}
    <div className="admin-list">{filtered.map(item => <div className="admin-row" key={item.id}>
      <div className="admin-item"><b>{item.name} {item.hidden_at && <span>· UKRYTE</span>}</b><span>{item.gift}</span><small>Dodano: {new Date(item.created_at).toLocaleString("pl-PL")}</small></div>
      <div className="admin-actions"><button className="icon-button" title="Edytuj" onClick={() => setEditing(item)}><Pencil size={16} /></button><button className="icon-button" title={item.hidden_at ? "Przywróć" : "Ukryj"} onClick={() => void toggleHidden(item)}>{item.hidden_at ? <RefreshCw size={16} /> : <Trash2 size={16} />}</button></div>
    </div>)}</div>
    {editing && <div className="modal-backdrop"><div className="form-card modal-card">
      <div className="modal-title"><h2>Edytuj wpis</h2><button className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button></div>
      <form onSubmit={saveEdit}>
        <Field label="Imię" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} required />
        <Field label="Prezent" value={editing.gift} onChange={v => setEditing({ ...editing, gift: v })} required />
        <Field label="Link" value={editing.url ?? ""} onChange={v => setEditing({ ...editing, url: v })} type="url" />
        <Field label="Notatki" value={editing.notes ?? ""} onChange={v => setEditing({ ...editing, notes: v })} multiline />
        <button className="button full" disabled={busy}><Check size={16} /> Zapisz</button>
      </form>
    </div></div>}
  </section>;
}