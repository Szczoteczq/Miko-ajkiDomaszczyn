import { Link } from "react-router-dom";
export default function NotFound() {
  return <section className="narrow-page page-intro"><div className="eyebrow">404</div><h1>Nie znaleziono strony</h1><p>Podany adres jest nieprawidłowy.</p><Link className="button" to="/">Wróć na stronę główną</Link></section>;
}