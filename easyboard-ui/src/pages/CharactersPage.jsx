import { useEffect, useState } from "react";
import "./CharactersPage.css";
import { getUniverse, subscribeToUniverseUpdate } from "../graph/graphModel";

export default function CharactersPage() {
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fonction de (re)chargement depuis le modèle global
  const refresh = (universe) => {
    try {
      const nodes = universe?.nodes ?? [];
      const list = nodes.map((n) => ({
        id: n?.data?.id ?? "",
        name: n?.data?.label ?? "(sans nom)",
        tags: Array.isArray(n?.data?.tags) ? n.data.tags : [],
        description: n?.data?.description ?? "",
      }));
      setCharacters(list);

      // si le perso sélectionné n’existe plus, on le désélectionne
      if (selected && !list.some((c) => c.id === selected.id)) {
        setSelected(null);
      }
    } catch (e) {
      console.error("CharactersPage refresh error:", e);
      setCharacters([]);
      setSelected(null);
    }
  };

  useEffect(() => {
    // chargement initial
    refresh(getUniverse());
    // abonnement aux mises à jour (import ZIP, etc.)
    const unsub = subscribeToUniverseUpdate(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="characters-container">
      {/* PANEL GAUCHE */}
      <aside className="characters-panel">
        <h3>Personnages</h3>
        <input
          className="search-input"
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="characters-list">
          {filtered.map((c) => (
            <div
              key={c.id || c.name}
              className={`character-item ${selected?.id === c.id ? "active" : ""}`}
              onClick={() => setSelected(c)}
              title={c.name}
            >
              {c.name}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-hint">Aucun personnage</div>
          )}
        </div>
      </aside>

      {/* ZONE DROITE */}
      <section className="character-detail">
        {selected ? (
          <div className="detail-card">
            <h2>{selected.name}</h2>
            <p className="desc">
              {selected.description || "Aucune description."}
            </p>

            {selected.tags?.length > 0 && (
              <>
                <h4>Tags</h4>
                <ul className="tags">
                  {selected.tags.map((t, i) => (
                    <li key={i}>
                      <strong>{t.name}</strong> <em>({t.type})</em> :{" "}
                      <span>{String(t.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="placeholder">Sélectionnez un personnage…</div>
        )}
      </section>
    </div>
  );
}
