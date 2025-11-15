import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import {
  getUniverse,
  updateNodePosition,
  exportUniverse,
  importUniverse,
} from "../graph/graphModel";
import "./UniversePage.css";

export default function UniversePage() {
  const cyRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cyInstance, setCyInstance] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // === Fonction pour créer / charger le graphe ===
  const loadGraph = (data) => {
    const cy = cytoscape({
      container: cyRef.current,
      elements: [
        ...data.nodes, // déjà au bon format { data:{...}, position:{...} }
        ...data.edges, // déjà au bon format { data:{ source,target,label,... } }
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#61dafb",
            label: "data(label)",
            "text-valign": "center",
            color: "#222",
            "font-size": "14px",
            width: "60px",
            height: "60px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "text-rotation": "autorotate",
          },
        },
        {
          selector: ":selected",
          style: {
            "background-color": "#ffb703",
            "line-color": "#ffb703",
            "target-arrow-color": "#ffb703",
          },
        },
      ],
      layout: { name: "preset" }, // garde la disposition du fichier
      wheelSensitivity: 1.5,
    });
    cy.ready(() => cy.fit());
    // Synchronise les déplacements avec le modèle
    cy.on("dragfree", "node", (evt) => {
      const node = evt.target;
      updateNodePosition(node.id(), node.position());
    });

    setCyInstance(cy);
  };

  // === Chargement initial du graphe ===
  useEffect(() => {
    loadGraph(getUniverse());
    return () => cyInstance && cyInstance.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Gestion de l'import d'un univers ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importUniverse(file, (newData) => {
      if (cyInstance) cyInstance.destroy();
      loadGraph(newData);
    });
  };

  return (
    <div className={`universe-container ${isCollapsed ? "collapsed" : ""}`}>
      <aside className="side-panel">
        {/* bouton rond collé au bord du panneau */}
        <button
          className="toggle-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Ouvrir le panneau" : "Fermer le panneau"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>

        {/* contenu du panneau (caché quand replié) */}
        <div className="panel-content">
          <button
            className="panel-button"
            onClick={() => fileInputRef.current.click()}
          >
            📂 Importer
          </button>
          <button className="panel-button" onClick={exportUniverse}>
            💾 Exporter
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </aside>

      <section ref={cyRef} className="graph-container" />
    </div>
  );
}
