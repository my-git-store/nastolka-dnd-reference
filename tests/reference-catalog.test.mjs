import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = new URL("../src/modules/public/reference/data/", import.meta.url);
const monsters = JSON.parse(await readFile(new URL("monsters.json", data), "utf8"));
const spells = JSON.parse(await readFile(new URL("spells.json", data), "utf8"));

// Independent fingerprints of the named stat blocks in the Wizards SRD 5.2.1 PDF.
// Sorting keeps the checks independent of presentation, translation and JSON order.
function fingerprint(lines) {
  return createHash("sha256").update(lines.sort().join("\n")).digest("hex");
}

test("английские имена, фиксированные КД, хиты и ПО совпадают с официальным SRD", () => {
  const english = entry => entry.englishName.toLowerCase().replaceAll("’", "'");
  assert.equal(fingerprint(monsters.map(english)),
    "b5373379379042e635382a847bf61e2ff40991b3970d74f9c05bc8ded16415ed");
  const fixed = monsters.filter(entry => typeof entry.hitPoints === "number" && typeof entry.armorClass === "number");
  assert.equal(fixed.length, 331);
  assert.equal(fingerprint(fixed.map(entry =>
    [english(entry), entry.armorClass, entry.hitPoints, entry.challenge].join("|"))),
    "85c65857897eb3b3262e581a965f8ee36b3c1886a2f39ac2ac51e9aba1039b5c");
});

test("число названных действий и особенностей в каждом основном статблоке соответствует PDF", () => {
  const mainChapters = monsters.filter(entry => entry.sourcePage >= 258);
  assert.equal(mainChapters.length, 330);
  const byCreature = mainChapters.map(entry => {
    const actions = entry.body.match(/^\*\*_[^\n]+?_\*\*/gm) ?? [];
    return entry.englishName.toLowerCase().replaceAll("’", "'") + "|" + actions.length;
  });
  assert.equal(fingerprint(byCreature), "45bbfd9636113de1d80e09ebc0fba64dd9191c336e32cf37fa431e17b2d7e6f2");
  const shrieker = monsters.find(entry => entry.id === "shrieker-fungus");
  assert.match(shrieker.body, /#### Реакции[\s\S]+300 фут/);
  assert.equal(mainChapters.filter(entry => entry.body.includes("#### Реакции")).length, 24);
  for (const [id, dc] of [["green-hag", 11], ["sea-hag", 11], ["night-hag", 14]]) {
    const trait = monsters.find(entry => entry.id === id).body.split("\n").find(line => line.startsWith("**_Магия ковена."));
    assert.ok(trait?.includes("СЛ спасброска " + dc));
    assert.ok(trait.includes("после длительного отдыха"));
  }
});

test("обновлённые русские заголовки сохраняют прежние названия для поиска", () => {
  const dog = monsters.find(entry => entry.id === "blink-dog");
  assert.deepEqual([dog.name, dog.englishName, dog.sourcePage, dog.armorClass, dog.hitPoints, dog.challenge],
    ["Мерцающий пёс", "Blink Dog", 266, 13, 22, "1/4"]);
  assert.ok(dog.aliases.includes("Мигающий пёс"));
  assert.match(dog.body, /#### Бонусные действия[\s\S]+4-6[\s\S]+40 футов/);
  assert.ok(monsters.find(entry => entry.name === "Верёвочник").aliases.includes("Веревник"));
  const alt = monsters.find(entry => entry.id === "owlbear");
  assert.equal(alt.name, "Совомедведь");
  assert.ok(alt.aliases.includes("Медвесыч"));
  for (const monster of monsters.filter(entry => entry.aliases)) {
    const names = [monster.name, ...monster.aliases].map(value => value.toLowerCase().replaceAll("ё", "е"));
    assert.equal(new Set(names).size, names.length, monster.id);
  }
  const youngWhite = monsters.find(entry => entry.id === "young-white-dragon");
  assert.match(youngWhite.body, /СПАС\s*\|\s*\+4\s*\|\s*\+3\s*\|\s*\+4\s*\|\s*2\s*\|/);
  assert.match(youngWhite.body, /D&D Beyond стоит «−2»/);
});

test("каталоги SRD полностью заполнены и у каждой записи уникальный идентификатор", () => {
  for (const [records, count] of [[monsters, 336], [spells, 339]]) {
    assert.equal(records.length, count);
    assert.equal(new Set(records.map(entry => entry.id)).size, count);
    assert.equal(new Set(records.map(entry => entry.englishName)).size, count);
    for (const entry of records) {
      assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.match(entry.name, /[А-Яа-яЁё]/);
      assert.match(entry.body, /[А-Яа-яЁё]/);
    }
  }
});

test("бестиарий содержит животных, легендарные действия и статблоки из магических предметов", () => {
  const spider = monsters.find(entry => entry.id === "spider");
  assert.equal(spider.challenge, "0");
  assert.equal(spider.hitPoints, 1);
  assert.match(monsters.find(entry => entry.id === "aboleth").body, /Легендарные действия/);
  const legendary = monsters.filter(entry => entry.body.includes("#### Легендарные действия"));
  assert.equal(legendary.length, 30);
  assert.ok(legendary.every(entry => entry.body.includes("**Число использований:** 3")));
  assert.equal(legendary.filter(entry => entry.body.includes("3 (4 в логове)")).length, 27);
  const fly = monsters.find(entry => entry.id === "giant-fly");
  assert.equal(fly.armorClass, 11);
  assert.equal(fly.hitPoints, 19);
  const avatar = monsters.find(entry => entry.id === "avatar-of-death");
  assert.equal(avatar.armorClass, 20);
  assert.equal(avatar.hitPoints, "Половина максимума хитов призывателя");
  assert.equal(avatar.challenge, "Нет");
  const steed = monsters.find(entry => entry.id === "otherworldly-steed");
  assert.equal(steed.armorClass, "10 + 1 за уровень заклинания");
  assert.match(steed.body, /Поиск скакуна/);
});

test("книга содержит заговоры, уровни 1–9, полные описания и вложенные таблицы", () => {
  const counts = Array.from({ length: 10 }, (_, level) => spells.filter(entry => entry.level === level).length);
  assert.deepEqual(counts, [27, 57, 57, 42, 34, 38, 31, 20, 17, 16]);
  assert.equal(spells.filter(entry => /концентрация/i.test(entry.duration)).length, 133);
  assert.equal(spells.filter(entry => /ритуал/i.test(entry.castingTime)).length, 29);
  for (const spell of spells) {
    for (const field of ["school", "castingTime", "range", "duration", "components"]) {
      assert.ok(spell[field].trim(), spell.id + ": " + field);
    }
  }
  const fireball = spells.find(entry => entry.id === "fireball");
  assert.equal(fireball.level, 3);
  assert.match(fireball.body, /8d6/);
  assert.doesNotMatch(fireball.body, /огибает углы/i);
  assert.match(spells.find(entry => entry.id === "spiritual-weapon").body, /1d8 за каждый уровень/);
  assert.match(spells.find(entry => entry.id === "find-steed").body, /^> *\|/m);
});
