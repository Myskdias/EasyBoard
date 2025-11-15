import { useState, useEffect } from "react";
import "./CharactersPage.css";
import { getUniverse } from "../graph/graphModel";

export default function CharactersPage() {
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // 🔄 Charge les personnages depuis le modèle global
  useEffect(() => {
    // Fonction pour rafraîchir la liste
    const refreshCharacters = (universe) => {
      if (universe && universe.nodes) {
        const chars = universe.nodes.map((n) => ({
          id: n.data.id,
          name: n.data.label,
          tags: n.data.tags || [],
          description: n.data.description || "",
        }));
        setCharacters(chars);
      }
    };

    // Chargement initial
    refreshCharacters(getUniverse());

    // 🔔 Abonnement aux changements
    const unsubscribe = subscribeToUniverseUpdate(refreshCharacters);

    // Nettoyage quand le composant est démonté
    return unsubscribe;
  }, []);

  // 🔍 Filtrage
  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="characters-container">
      {/* === PANEL GAUCHE === */}
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
            <p>{selectedCharacter.description || "Aucune description"}</p>

            {selectedCharacter.tags.length > 0 && (
              <div>
                <h4>Tags :</h4>
                <ul>
                  {selectedCharacter.tags.map((t, i) => (
                    <li key={i}>
                      <strong>{t.name}</strong> ({t.type}) :{" "}
                      {t.value.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>Sélectionnez un personnage pour voir sa fiche.</p>
        )}
      </section>
    </div>
  );
}
