import { useState } from "react";
import "./CharactersPage.css";

export default function CharactersPage() {
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState([
    { id: 1, name: "Arya Stark" },
    { id: 2, name: "Jon Snow" },
    { id: 3, name: "Tyrion Lannister" },
    { id: 4, name: "Daenerys Targaryen" },
    { id: 5, name: "Sansa Stark" },
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Filtrage simple
  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="characters-container">
      {/* === PANEL LATÉRAL === */}
      <aside className="characters-panel">
        <h3>Personnages</h3>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="characters-list">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`character-item ${
                selectedCharacter?.id === c.id ? "active" : ""
              }`}
              onClick={() => setSelectedCharacter(c)}
            >
              {c.name}
            </div>
          ))}
        </div>
      </aside>

      {/* === ZONE DE DROITE === */}
      <section className="character-detail">
        {selectedCharacter ? (
          <div>
            <h2>{selectedCharacter.name}</h2>
            <p>Fiche personnage (à venir...)</p>
          </div>
        ) : (
          <p>Sélectionnez un personnage pour voir sa fiche</p>
        )}
      </section>
    </div>
  );
}