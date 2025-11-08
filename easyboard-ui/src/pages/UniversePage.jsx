/**
 * Page Univers — affichage du graphe interactif avec Cytoscape.js
 */
import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function UniversePage() {
  // useRef permet d’obtenir une référence au conteneur <div> du graphe.
  const cyRef = useRef(null);

  useEffect(() => {
    // Création de l'instance Cytoscape au montage du composant
    const cy = cytoscape({
      container: cyRef.current, // div HTML où le graphe sera rendu

      // === Données du graphe : nœuds et arêtes ===
      elements: [
        // Nœuds (les personnages ou entités)
        { data: { id: "a", label: "Alice" } },
        { data: { id: "b", label: "Bob" } },
        { data: { id: "c", label: "Charlie" } },

        // Arêtes (les relations entre nœuds)
        { data: { id: "ab", source: "a", target: "b", label: "ami" } },
        { data: { id: "ac", source: "a", target: "c", label: "ennemi" } },
      ],

      // === Style visuel du graphe ===
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#61dafb",
            "label": "data(label)",
            "text-valign": "center",
            "color": "#222",
            "font-size": "14px",
            "width": "60px",
            "height": "60px",
          },
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "label": "data(label)",
            "font-size": "12px",
            "text-rotation": "autorotate",
            "color": "#444",
          },
        },
        {
          selector: ":selected",
          style: {
            "background-color": "#ffb703",
            "line-color": "#ffb703",
            "target-arrow-color": "#ffb703",
            "source-arrow-color": "#ffb703",
          },
        },
      ],

      // === Mise en page automatique initiale ===
      layout: {
        name: "cose", // algo de disposition (circle, grid, breadthfirst, cose…)
        animate: true,
      },

      // === Comportement ===
      wheelSensitivity: 0.2, // vitesse du zoom
    });

    // Nettoyage à la destruction du composant (bon réflexe React)
    return () => cy.destroy();
  }, []);

  // Le conteneur où le graphe sera affiché
  return (
    <div
      ref={cyRef}
      style={{
        width: "100%",
        height: "80vh", // prend 80 % de la hauteur visible
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    />
  );
}