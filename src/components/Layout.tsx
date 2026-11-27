import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Gift, Moon, Sun } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("mikolajki-theme") === "dark"; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", dark);
    try { localStorage.setItem("mikolajki-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

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
        <div className="header-controls">
          <nav>
            <NavLink to="/" end>Dodaj prezent</NavLink>
            <NavLink to="/Lista">Lista życzeń</NavLink>
          </nav>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDark(value => !value)}
            aria-label={dark ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
            title={dark ? "Jasny motyw" : "Ciemny motyw"}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span>{dark ? "Jasny" : "Ciemny"}</span>
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer>Mikołajki szkolne</footer>
    </div>
  );
}