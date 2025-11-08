// src/graph/graphModel.js

import universeData from "../data/universe.json";

/**
 * Le modèle central de l'univers.
 * On le garde en mémoire pour le modifier facilement.
 */
let currentUniverse = JSON.parse(JSON.stringify(universeData));

/**
 * Renvoie l'univers courant (nœuds + arêtes)
 */
export function getUniverse() {
  return currentUniverse;
}

/**
 * Met à jour la position d’un nœud (appelée quand tu le déplaces dans Cytoscape)
 */
export function updateNodePosition(id, position) {
  const node = currentUniverse.nodes.find((n) => n.id === id);
  if (node) node.position = position;
}

/**
 * Ajoute un nouveau nœud
 */
export function addNode(id, label, position = { x: 0, y: 0 }) {
  currentUniverse.nodes.push({ id, label, tags: [], position });
}

/**
 * Ajoute une arête entre deux nœuds
 */
export function addEdge(source, target, label = "") {
  const id = `${source}-${target}`;
  currentUniverse.edges.push({ id, source, target, label });
}

/**
 * Sauvegarde l’univers courant sous forme de fichier JSON téléchargeable
 */
export function exportUniverse() {
  const blob = new Blob([JSON.stringify(currentUniverse, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "univers.json";
  a.click();
}

/**
 * 📂 Importer un univers depuis un fichier JSON (via un input type="file")
 */
export function importUniverse(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.nodes && data.edges) {
        currentUniverse = data;
        onLoaded && onLoaded(currentUniverse);
      } else {
        alert("Fichier invalide : structure manquante (nodes/edges)");
      }
    } catch (err) {
      alert("Erreur de lecture du fichier JSON");
      console.error(err);
    }
  };
  reader.readAsText(file);
}