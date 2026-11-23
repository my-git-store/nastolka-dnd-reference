import { restoreMissingReaction } from "./missing-reactions.mjs";
import { localizeMonster } from "./monster-names.mjs";

const chapters = [
  { chapter: "12_MonstersA-Z.md", index: "14_Glossary/04_Monsters.md", count: 235 },
  { chapter: "13_Animals.md", index: "14_Glossary/05_Animals.md", count: 95 },
];

// SRD 5.2.1, pp. 257–341: OmnisGM preserves the actions but omits the uses paragraph.
const legendaryHeading = "#### Легендарные действия";
const threeUsesEvenInLair = new Set(["solar", "tarrasque", "unicorn"]);

function restoreLegendaryUses(id, body) {
  if (!body.includes(legendaryHeading)) return body;
  const maximum = threeUsesEvenInLair.has(id) ? "3" : "3 (4 в логове)";
  const rule = "**Число использований:** " + maximum + ". Сразу после окончания хода другого существа " +
    "можно потратить одно использование и выполнить одно из перечисленных действий. " +
    "Все использования восстанавливаются в начале каждого собственного хода.";
  return body.replace(legendaryHeading, legendaryHeading + "\n\n" + rule);
}

function restoreStatBlock(id, body) {
  const covenSave = { "green-hag": 11, "night-hag": 14, "sea-hag": 11 }[id];
  if (covenSave) {
    const trait = "**_Магия ковена._** В пределах 30 футов хотя бы от двух союзных карг эта карга " +
      "может сотворить одно из шести заклинаний: *Предсказание*, *Поиск фамильяра*, *Опознание*, " +
      "*Поиск объекта*, *Наблюдение* или *Невидимый слуга*. Время сотворения обычное, материальные " +
      "компоненты не нужны. Заклинательная характеристика — Интеллект (СЛ спасброска " + covenSave + "). " +
      "Повторно сотворить то же заклинание с помощью этой особенности можно после длительного отдыха.";
    body = body.replace("#### Особенности", "#### Особенности\n\n" + trait);
  }
  if (id === "young-white-dragon") {
    const oldRow = "|   СПАС   |   +4   |   +3   |   +4   |   -2   |   +3   |   +1   |";
    if (!body.includes(oldRow)) throw new Error("Проверьте строку спасбросков молодого белого дракона");
    body = body.replace(oldRow, oldRow.replace("-2", "2")) +
      "\n\nВ печатном SRD 5.2.1 (с. 340) спасбросок Интеллекта указан как «2». " +
      "В отдельной карточке молодого белого дракона на D&D Beyond стоит «−2».";
  }
  return restoreSpellcasting(id, restoreLegendaryUses(id, restoreMissingReaction(id, body)));
}

// The bilingual transcription drops parenthetical casting conditions from the spell lists.
// These qualifiers come from the corresponding stat blocks in the official SRD 5.2.1 PDF.
const shapechange = "только форма зверя или гуманоида; заклинание не даёт временных хитов, а для его поддержания не нужны ни концентрация, ни временные хиты";
const spellQualifiers = {
  "adult-black-dragon": { "Кислотная стрела": 3 },
  "ancient-black-dragon": { "Кислотная стрела": 4, "Сфера кислоты": 5 },
  "ancient-blue-dragon": { "Раскалывание": 3 },
  "adult-brass-dragon": { "Изменение формы": shapechange },
  "ancient-brass-dragon": { "Палящий луч": 3, "Изменение формы": shapechange },
  "adult-bronze-dragon": { "Направляющий снаряд": 2, "Изменение формы": shapechange },
  "ancient-bronze-dragon": { "Направляющий снаряд": 2, "Изменение формы": shapechange },
  "adult-copper-dragon": { "Ментальный шип": 4, "Изменение формы": shapechange },
  "ancient-copper-dragon": { "Ментальный шип": 5, "Изменение формы": shapechange },
  "adult-gold-dragon": { "Направляющий снаряд": 2, "Изменение формы": shapechange },
  "ancient-gold-dragon": { "Направляющий снаряд": 4, "Небесный огонь": 6, "Изменение формы": shapechange },
  "adult-green-dragon": { "Ментальный шип": 3 },
  "ancient-green-dragon": { "Ментальный шип": 5 },
  "adult-red-dragon": { "Приказ": 2 },
  "ancient-red-dragon": { "Приказ": 2, "Палящий луч": 3, "Огненный шар": 6 },
  "adult-silver-dragon": { "Град": 5, "Изменение формы": shapechange },
  "ancient-silver-dragon": { "Ледяной нож": 2, "Град": 7, "Изменение формы": shapechange },
  "archmage": { "Молния": 7, "Конус холода": 9, "Доспехи мага": "учтены в КД", "Пустой разум": "наложен перед боем" },
  "couatl": { "перевоплощение": shapechange },
  "deva": { "перевоплощение": shapechange },
  "djinni": { "сотворение пищи и воды": "вместо воды можно создать вино" },
  "dryad": { "очарование чудовища": "длится 24 часа и заканчивается раньше, если дриада наложит заклинание снова" },
  "efreeti": { "огненная стена": 7 },
  "green-hag": { "Маскировка": "длится 24 часа", "Невидимость": "только на себя; невидимая карга не оставляет следов", "луч болезни": 3 },
  "guardian-naga": { "лечение ран": 6, "небесный огонь": 6 },
  "lamia": { "Маскировка": "можно принять облик Большого или Среднего двуногого существа" },
  "lich": { "огненный шар": 5, "Молния": 5 },
  "mage": { "огненный шар": 4, "доспехи мага": "учтены в КД" },
  "mummy-lord": { "нашествие насекомых": 7 },
  "night-hag": { "волшебная стрела": 4, "уход в иной мир": "только на себя" },
  "oni": { "очарование личности": 2 },
  "spirit-naga": { "удержание личности": 3, "Молния": 4 },
};

function restoreSpellcasting(id, body) {
  const overrides = Object.entries(spellQualifiers[id] ?? {});
  if (!overrides.length) return body;
  if (id === "night-hag") {
    // These are mentions in Nightmare Haunting, not three extra daily spells (SRD p. 311).
    body = body.replace("\n- **По желанию:**\n- **1/День каждое:** *мечта*, *защита от добра и зла*, *магический круг*\n", "\n");
  }
  const lines = body.split("\n");
  for (const [spell, qualifier] of overrides) {
    const token = "*" + spell + "*";
    const index = lines.findIndex(line => line.startsWith("- **") && line.includes(token));
    if (index < 0) throw new Error("Уточнение не соответствует списку заклинаний: " + id + " / " + spell);
    const note = typeof qualifier === "number" ? qualifier + "-й уровень" : qualifier;
    lines[index] = lines[index].replace(token, token + " (" + note + ")");
  }
  return lines.join("\n");
}

// These two stat blocks appear in the magic item descriptions rather than the monster index.
function itemCreatures(markdown) {
  const items = [
    { id: "giant-fly", name: "Гигантская муха", englishName: "Giant Fly", size: "Большой", type: "Зверь",
      source: "«Образная фигурка чудесной силы», эбеновая муха (с. 222)." },
    { id: "avatar-of-death", name: "Аватар смерти", englishName: "Avatar of Death", size: "Средний", type: "Нежить",
      source: "«Таинственная колода», карта «Череп» (с. 232)." },
  ];
  const lines = markdown.split(/\r?\n/);
  return items.map(({ source, ...item }) => {
    const heading = "> #### " + item.name + " (" + item.englishName + ")";
    const start = lines.indexOf(heading);
    if (start < 0) throw new Error("Не найден статблок в магических предметах: " + item.englishName);
    const content = [];
    for (let i = start + 1; i < lines.length && lines[i].startsWith(">"); i++) {
      content.push(lines[i].replace(/^> ?/, ""));
    }
    const body = content.join("\n").trim();
    const ac = body.match(/^\*\*КД\*\* (\d+)/m)?.[1];
    const hp = body.match(/^\*\*Хиты\*\* (.+)$/m)?.[1];
    const challenge = body.match(/^\*\*ПО\*\* (\S+)/m)?.[1];
    if (!ac || !hp || !challenge) throw new Error("Неполные параметры существа: " + item.englishName);
    const fixedHP = hp.match(/^\d+(?= |$)/);
    return { ...item, challenge, armorClass: Number(ac), hitPoints: fixedHP ? Number(fixedHP[0]) : hp,
      body: "Из раздела «Магические предметы» SRD 5.2.1. " + source + "\n\n" + body };
  });
}

// Only the chapter and alphabetical group headings are omitted from the entry text.
function parseStatBlocks(markdown) {
  const text = markdown.replace(/\r\n/g, "\n");
  const headings = [...text.matchAll(/^(#{1,3}) (.+)$/gm)];
  const blocks = new Map();

  for (const [position, heading] of headings.entries()) {
    const body = text.slice(heading.index + heading[0].length, headings[position + 1]?.index).trim();
    if (heading[1] !== "###") {
      if (body) throw new Error("Найден текст вне статблока: " + heading[2]);
      continue;
    }
    const names = /^(.+) \(([^()]+)\)$/.exec(heading[2]);
    if (!names || !body || blocks.has(names[2])) {
      throw new Error("Некорректный или повторный заголовок существа: " + heading[2]);
    }
    if (/!\[|\]\(|<\/?[a-z][\w:-]*(?:\s|\/?>)|https?:\/\//i.test(body)) {
      throw new Error("Текст существа содержит ссылку или разметку, требующую проверки: " + names[2]);
    }
    blocks.set(names[2], { name: names[1], body });
  }
  return blocks;
}

export async function importMonsters(read) {
  const monsters = [];
  const ids = new Set();
  for (const { chapter, index, count } of chapters) {
    const [markdown, glossary] = await Promise.all([read(chapter), read(index)]);
    const blocks = parseStatBlocks(markdown);
    const rows = glossary.split(/\r?\n/).filter(line => line.startsWith("| ")).slice(1);
    if (rows.length !== count || blocks.size !== count) {
      throw new Error("Не совпало число существ в главе и указателе: " + chapter);
    }
    for (const row of rows) {
      const fields = row.trim().slice(1, -1).split("|").map(field => field.trim());
      const [name, englishName, size, type] = fields;
      // The monster index also includes alignment between type and challenge.
      const [challenge, ac, hp] = fields.slice(-3);
      const entry = blocks.get(englishName);
      if (!entry || entry.name !== name) throw new Error("Запись указателя отсутствует в главе: " + name);

      const id = englishName.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { body } = entry;
      if (!id || ids.has(id)) throw new Error("Неоднозначный идентификатор существа: " + englishName);
      if (!size || !type ||
        body.match(/^- \*\*Класс доспеха:\*\* (\d+)\b/m)?.[1] !== ac ||
        body.match(/^- \*\*Хиты:\*\* (\d+)\b/m)?.[1] !== hp ||
        body.match(/^- \*\*ПО\*\* (\d+(?:\/\d+)?)\b/m)?.[1] !== challenge) {
        throw new Error("Параметры в указателе расходятся со статблоком: " + englishName);
      }
      ids.add(id);
      monsters.push({ id, name, englishName, size, type, challenge, armorClass: Number(ac), hitPoints: Number(hp),
        body: restoreStatBlock(id, body) });
    }
  }
  return monsters.concat(itemCreatures(await read("10_MagicItems.md"))).map(localizeMonster);
}
