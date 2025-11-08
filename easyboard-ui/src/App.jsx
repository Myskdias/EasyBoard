import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import UniversePage from "./pages/UniversePage";
import CharactersPage from "./pages/CharactersPage";
import "./App.css"; // Import du style global

/**
 * Composant principal de l'application EasyBoard.
 * - Définit la navigation (menu du haut)
 * - Affiche la page correspondante selon l'URL
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Conteneur principal de l'application */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* === Barre de navigation === */}
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            🌌 Univers
          </NavLink>
          <NavLink to="/characters" className={({ isActive }) => (isActive ? "active" : "")}>
            🧙 Personnages
          </NavLink>
        </nav>

        {/* === Contenu principal === */}
        <main>
          <Routes>
            <Route path="/" element={<UniversePage />} />
            <Route path="/characters" element={<CharactersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
