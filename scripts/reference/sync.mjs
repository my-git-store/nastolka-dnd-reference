import { readFile, writeFile } from "node:fs/promises";
import { importMonsters } from "./import-monsters.mjs";
import { importSpells } from "./import-spells.mjs";
import { creaturesFromSpells } from "./spell-creatures.mjs";

const revision = "1f7192be159e84f2db7212565866747094e3b9de";
const source = `https://raw.githubusercontent.com/OmnisGM-App/OmnisGM-Rules/${revision}/src/dnd/srd-5.2/ru/`;
const directory = new URL("../../src/modules/public/reference/data/", import.meta.url);
const checkOnly = process.argv[2] === "--check";
if (process.argv.length > (checkOnly ? 3 : 2)) throw new Error("Допустимый аргумент: --check");

async function readChapter(path) {
  const response = await fetch(source + path, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Не удалось получить ${path} (HTTP ${response.status})`);
  return response.text();
}

const [monsters, spells] = await Promise.all([importMonsters(readChapter), importSpells(readChapter)]);
monsters.push(...creaturesFromSpells(spells));
const pages = JSON.parse(await readFile(new URL("./monster-pages.json", import.meta.url), "utf8"));
if (Object.keys(pages).length !== monsters.length) throw new Error("Указатель страниц SRD расходится с каталогом существ");
const sourcedMonsters = monsters.map(({ body, ...entry }) => {
  const sourcePage = pages[entry.englishName];
  if (!Number.isInteger(sourcePage) || sourcePage < 1 || sourcePage > 364) {
    throw new Error("Проверьте страницу SRD: " + entry.englishName);
  }
  return { ...entry, sourcePage, body };
});
for (const [file, records] of [["monsters.json", sourcedMonsters], ["spells.json", spells]]) {
  const url = new URL(file, directory);
  const text = JSON.stringify(records, null, 2) + "\n";
  if (checkOnly) {
    const actual = (await readFile(url, "utf8")).replaceAll("\r\n", "\n");
    if (actual !== text) throw new Error(`${file} расходится с источником ${revision}`);
  } else {
    await writeFile(url, text);
  }
  console.log(`${file}: ${records.length}`);
}
