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
  console.log("➡️ importUniverse() called with file:", file);

  const zip = new JSZip();
  let loaded;

  try {
    loaded = await zip.loadAsync(file);
    console.log("✔ ZIP loaded. Files inside:", Object.keys(loaded.files));
  } catch (err) {
    console.error("❌ Failed to load ZIP:", err);
    return;
  }

  const nodes = [];
  const edges = [];

  console.log("➡️ Starting to scan files...");

  for (const path in loaded.files) {
    console.log("🔍 Checking file:", path);

    if (path.startsWith("characters/") && path.endsWith(".json")) {
      console.log("📄 Character file detected:", path);

      let content;
      try {
        content = await loaded.files[path].async("string");
      } catch (err) {
        console.error("❌ Failed to read file:", path, err);
        continue;
      }

      let charData;
      try {
        charData = JSON.parse(content);
        console.log("✔ Parsed JSON:", charData);
      } catch (err) {
        console.error("❌ Failed to parse JSON in", path, err);
        continue;
      }

      // === Création du nœud ===
      try {
        nodes.push({
          data: {
            id: String(charData.id),
            label: String(charData.name),

            // NOUVEAU
            shortDescription: charData.shortDescription || "",
            description: charData.description || "",

            tags: Array.isArray(charData.tags) ? charData.tags : [],
          },

          position:
            charData.position &&
            typeof charData.position.x === "number" &&
            typeof charData.position.y === "number"
              ? charData.position
              : { x: 0, y: 0 },
        });

        console.log("✔ Node created for:", charData.name);
      } catch (err) {
        console.error("❌ Failed to create node for:", charData, err);
      }

      // === Création des arêtes ===
      if (Array.isArray(charData.relations)) {
        console.log(`➡️ Creating ${charData.relations.length} edges for ${charData.name}`);

        for (const rel of charData.relations) {
          try {
            edges.push({
              data: {
                id: `${charData.id}-${rel.target}-${rel.label}`,
                source: charData.id,
                target: rel.target,
                label: rel.label,
              },
            });
            console.log("   ✔ Edge created:", rel);
          } catch (err) {
            console.error("❌ Failed to create edge:", rel, err);
          }
        }
      }
    }
  }

  console.log("➡️ Import finished.");
  console.log("📌 Nodes imported:", nodes.length);
  console.log("📌 Edges imported:", edges.length);

  currentUniverse = { nodes, edges };
  notifyUniverseUpdate();

  if (callback) callback(currentUniverse);

  console.log("✔ Universe loaded and callback executed.");
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

