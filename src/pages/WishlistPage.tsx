import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink, Search, Gift, RefreshCw,
  MessageCircle, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { api, friendlyError } from "../lib/api";
import type { Wishlist, WishlistComment } from "../types";

function WishlistPost({ item }: { item: Wishlist }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<WishlistComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      const data = await api.comments(item.id);
      setComments(data.comments);
      setLoaded(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  async function toggleComments() {
    const next = !expanded;
    setExpanded(next);
    if (next && !loaded) await loadComments();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError("");

    try {
      const data = await api.addComment(item.id, body);
      setComments(current => [...current, data.comment]);
      setDraft("");
      setLoaded(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="wish-card">
      <div className="wish-top">
        <span className="gift-bubble"><Gift size={18} /></span>
        <span className="wish-date">
          {new Date(item.created_at).toLocaleDateString("pl-PL")}
        </span>
      </div>

      <span className="wish-person">{item.name}</span>
      <h3>{item.gift}</h3>

      {item.notes && <p className="wish-notes">{item.notes}</p>}

      <div className="wish-actions">
        <button
          className="comments-toggle"
          onClick={() => void toggleComments()}
          aria-expanded={expanded}
        >
          <MessageCircle size={17} />
          <span>
            {loaded ? comments.length : ""}
            {loaded ? (comments.length === 1 ? " komentarz" : " komentarzy") : "Komentarze"}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {item.url && (
          <a
            className="product-link"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            Zobacz prezent <ExternalLink size={13} />
          </a>
        )}
      </div>

      {expanded && (
        <div className="comments-section">
          <div className="comments-heading">Dyskusja</div>

          {loading && <div className="comments-status">Ładowanie komentarzy...</div>}

          {!loading && loaded && comments.length === 0 && (
            <div className="comments-status">
              Brak komentarzy. Bądź pierwszą osobą, która coś napisze!
            </div>
          )}

          {comments.map(comment => (
            <div className="comment-item" key={comment.id}>
              <div className="comment-avatar">?</div>
              <div className="comment-content">
                <div className="comment-meta">
                  <strong>Anonimowo</strong>
                  <span>{new Date(comment.created_at).toLocaleString("pl-PL")}</span>
                </div>
                <p>{comment.body}</p>
              </div>
            </div>
          ))}

          {error && <div className="comment-error">{error}</div>}

          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Napisz anonimowy komentarz..."
              maxLength={500}
              rows={2}
            />
            <div className="comment-form-bottom">
              <span>{draft.length}/500</span>
              <button
                type="submit"
                className="comment-submit"
                disabled={!draft.trim() || sending}
              >
                <Send size={15} />
                {sending ? "Wysyłanie..." : "Dodaj komentarz"}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<Wishlist[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.list();
      setItems(data.items);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => items.filter(item =>
    `${item.name} ${item.gift} ${item.notes ?? ""}`
      .toLocaleLowerCase("pl")
      .includes(query.toLocaleLowerCase("pl"))
  ), [items, query]);

  return (
    <section className="content-page">
      <div className="page-intro">
        <div className="eyebrow">MIKOŁAJKI SZKOLNE</div>
        <h1>Lista życzeń</h1>
        <p>Prezenty zgłoszone przez uczestników.</p>
      </div>

      <div className="list-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Szukaj osoby lub prezentu..."
          />
        </div>
        <button
          className="icon-button"
          onClick={() => void load()}
          aria-label="Odśwież listę"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Ładowanie listy życzeń...</div>
      ) : error ? (
        <div className="empty-state error">
          {error}
          <button className="button secondary" onClick={() => void load()}>
            Spróbuj ponownie
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Gift size={30} />
          <b>Brak wpisów</b>
          <span>{query ? "Nie znaleziono wyników." : "Lista jest jeszcze pusta."}</span>
        </div>
      ) : (
        <div className="wishlist-grid">
          {filtered.map(item => (
            <WishlistPost item={item} key={item.id} />
          ))}
        </div>
      )}

      <p className="privacy-note">
        Widoczne są tylko wpisy. Prywatne linki do edycji nie są publikowane.
      </p>
    </section>
  );
}
