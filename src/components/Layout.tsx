import { Link, NavLink } from "react-router-dom";
import { Gift, Snowflake } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="snow snow-one">✳</div>
      <div className="snow snow-two">❄</div>
      <div className="snow snow-three">✻</div>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><Gift size={22} /></span>
          <span>Mikołajki<span className="brand-light">Szkolne</span></span>
        </Link>
        <nav>
          <NavLink to="/" end>Dodaj prezent</NavLink>
          <NavLink to="/Lista">Lista życzeń</NavLink>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        Mikołajki szkolne
      </footer>
    </div>
  );
}