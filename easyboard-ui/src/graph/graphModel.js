import JSZip from "jszip";

// --- Mini gestionnaire d’événements (style EventEmitter léger) ---
const listeners = new Set();

export function subscribeToUniverseUpdate(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); // permet de se désinscrire proprement
}

function notifyUniverseUpdate() {
  for (const cb of listeners) cb(currentUniverse);
}

/* ============================================================
 *   Modèle global : univers en mémoire
 * ============================================================ */
let currentUniverse = {
  nodes: [],
  edges: [],
};

/**
 * Retourne l’univers actuellement chargé en mémoire.
 */
export function getUniverse() {
  return currentUniverse;
}

/**
 * Met à jour la position d’un nœud.
 * Appelée lorsqu’un nœud est déplacé dans le graphe.
 */
export function updateNodePosition(nodeId, position) {
  const node = currentUniverse.nodes.find((n) => n.data.id === nodeId);
  if (node) node.position = position;
}

/* ============================================================
 *   IMPORT D’UN UNIVERS (ZIP)
 * ============================================================ */

/**
 * Importe un univers à partir d’un fichier ZIP contenant des fichiers
 *  - characters/<nom>.json
 * Chaque fichier JSON décrit un personnage complet.
 *
 * Exemple de format :
 * {
 *   "id": "1",
 *   "name": "Arya Stark",
 *   "tags": [
 *     { "name": "gender", "type": "string", "value": "Femme" },
 *     { "name": "age", "type": "int", "value": 15 }
 *   ],
 *   "description": "Une jeune fille de la maison Stark.",
 *   "position": { "x": 150, "y": 300 },
 *   "relations": [
 *     { "target": "2", "label": "ami" },
 *     { "target": "3", "label": "ennemi" }
 *   ]
 * }
 */
export async function importUniverse(file, callback) {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);

  const nodes = [];
  const edges = [];

  for (const path in loaded.files) {
    if (path.startsWith("characters/") && path.endsWith(".json")) {
      const content = await loaded.files[path].async("string");
      const charData = JSON.parse(content);

      // === Création du nœud ===
      nodes.push({
        data: {
          id: String(c.id),
          label: String(c.name),

          // NOUVEAU
          shortDescription: c.shortDescription || "",
          description: c.description || "",

          tags: Array.isArray(c.tags) ? c.tags : [],
        },

        position:
          c.position &&
          typeof c.position.x === "number" &&
          typeof c.position.y === "number"
            ? c.position
            : { x: 0, y: 0 },
      });

      // === Création des arêtes ===
      if (Array.isArray(charData.relations)) {
        for (const rel of charData.relations) {
          edges.push({
            data: {
              id: `${charData.id}-${rel.target}-${rel.label}`,
              source: charData.id,
              target: rel.target,
              label: rel.label,
            },
          });
        }
      }
    }
  }

  currentUniverse = { nodes, edges };
  notifyUniverseUpdate(); // 🔔 informe tous les abonnés
  if (callback) callback(currentUniverse);
}

/* ============================================================
 *   EXPORT D’UN UNIVERS (ZIP)
 * ============================================================ */

/**
 * Exporte l’univers courant en un fichier ZIP contenant un dossier /characters
 * Chaque personnage est sauvegardé dans un fichier JSON.
 */
export async function exportUniverse() {
  const zip = new JSZip();

  // Dossier characters/
  const folder = zip.folder("characters");

  currentUniverse.nodes.forEach((node) => {
    const data = node.data;

    // Sécurise la position (node.position est une fonction Cytoscape)
    const position =
      typeof node.position === "function"
        ? node.position()
        : node.position || { x: 0, y: 0 };

    // Relations sortantes
    const relations = currentUniverse.edges
      .filter((e) => e.data.source === data.id)
      .map((e) => ({
        target: e.data.target,
        label: e.data.label,
      }));

    // --- FORMAT FINAL D’UN PERSONNAGE ---
    const character = {
      id: data.id,
      name: data.label,

      // NOUVEAU
      shortDescription: data.shortDescription || "",
      description: data.description || "",

      tags: Array.isArray(data.tags) ? data.tags : [],

      position: position,
      relations: relations,
    };

    const fileName = `${data.label.replace(/\s+/g, "_")}.json`;
    folder.file(fileName, JSON.stringify(character, null, 2));
  });

  // Création du ZIP
  const blob = await zip.generateAsync({ type: "blob" });

  // Téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "universe.zip";
  a.click();
  URL.revokeObjectURL(url);
}

