// tools/generateTestUniverse.mjs
import JSZip from "jszip";
import { writeFile } from "fs/promises";

async function main() {
  const zip = new JSZip();

  // --- Définition des personnages de test ---
  const characters = [
    {
      id: "1",
      name: "Arya Stark",
      shortDescription: "Petite Stark en cavale.",
      description: "Une jeune fille de la maison Stark.",
      tags: [
        { name: "gender", type: "string", value: "Femme" },
        { name: "age", type: "int", value: 15 }
      ],
      position: { x: 150, y: 300 },
      relations: [
        { target: "2", label: "ami" },
        { target: "3", label: "méfiance" }
      ]
    },
    {
      id: "2",
      name: "Jon Snow",
      shortDescription: "Bâtard de Winterfell.",
      description: "Garde de Nuit, loyal et courageux.",
      tags: [
        { name: "gender", type: "string", value: "Homme" },
        { name: "age", type: "int", value: 22 }
      ],
      position: { x: 420, y: 260 },
      relations: [
        { target: "1", label: "protecteur" },
        { target: "3", label: "allié" }
      ]
    }
  ];

  // --- Ajout des fichiers JSON dans le dossier characters/ du ZIP ---
  for (const c of characters) {
    const fileName = `characters/${c.name.replace(/\s+/g, "_")}.json`;
    const json = JSON.stringify(c, null, 2);
    zip.file(fileName, json);
  }

  // --- Génération du ZIP ---
  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  // Écrit le fichier universe_test_v2.zip à la racine du projet
  const outputPath = "universe_test_v2.zip";
  await writeFile(outputPath, buffer);

  console.log(`✔ Fichier généré : ${outputPath}`);
}

main().catch((err) => {
  console.error("Erreur pendant la génération du ZIP :", err);
});
