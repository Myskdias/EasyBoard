// tools/generateUniverseV3.mjs
import JSZip from "jszip";
import { writeFile } from "fs/promises";

async function main() {
  const zip = new JSZip();
  const folder = zip.folder("characters");

  const characters = [
    {
      id: "1",
      name: "Arya Stark",
      shortDescription: "Petite Stark en cavale.",
      description: "Une jeune fille de la maison Stark, agile et tenace.",
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
        { target: "3", label: "allié" },
        { target: "4", label: "respect" }
      ]
    },
    {
      id: "3",
      name: "Tyrion Lannister",
      shortDescription: "Le Lutin de Castral Roc.",
      description: "Esprit vif, diplomate et stratège.",
      tags: [
        { name: "gender", type: "string", value: "Homme" },
        { name: "age", type: "int", value: 28 }
      ],
      position: { x: 320, y: 120 },
      relations: [
        { target: "2", label: "allié" },
        { target: "4", label: "conseiller" }
      ]
    },
    {
      id: "4",
      name: "Daenerys Targaryen",
      shortDescription: "La Mère des Dragons.",
      description: "Reine déterminée, charismatique et puissante.",
      tags: [
        { name: "gender", type: "string", value: "Femme" },
        { name: "age", type: "int", value: 23 }
      ],
      position: { x: 560, y: 340 },
      relations: [
        { target: "3", label: "respect mutuel" },
        { target: "2", label: "confiance" }
      ]
    }
  ];

  for (const c of characters) {
    const fileName = `characters/${c.name.replace(/\s+/g, "_")}.json`;
    const json = JSON.stringify(c, null, 2);
    folder.file(fileName, json);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  await writeFile("universe_test_v3.zip", buffer);
  console.log("✔ ZIP généré : universe_test_v3.zip");
}

main().catch((err) => {
  console.error("Erreur pendant la génération du ZIP :", err);
});
