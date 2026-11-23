// Material costs and consumption omitted in the translation, checked against SRD 5.2.1.
const componentCorrections = new Map([
  ["Divination", "В, С, М (благовония стоимостью 25+ зм, которые заклинание расходует)"],
  ["Circle of Death", "В, С, М (порошок из чёрной жемчужины стоимостью 500+ зм)"],
  ["True Seeing", "В, С, М (грибной порошок стоимостью 25+ зм, который заклинание расходует)"],
]);

// Localized passages that differ from the official SRD 5.2.1, pp. 131 and 165.
const effectCorrections = new Map([
  ["Fireball", [
    ["вылетает из вашего пальца", "устремляется от вас"],
    ["в 20-футовой сфере", "в сфере радиусом 20 футов"],
    ["Огонь огибает углы и поджигает горючие предметы в области, которые не носят и не несут.",
      "Горючие предметы в области заклинания загораются, если их никто не носит и не несёт."],
  ]],
  ["Spiritual Weapon", [
    ["Вы создаёте парящее призрачное оружие в пределах дистанции, которое существует на время действия заклинания.",
      "Вы создаёте парящую призрачную силу в форме оружия по вашему выбору. Она появляется в выбранном вами месте в пределах дистанции и сохраняется на время действия заклинания."],
    ["Бонусным действием в свой ход", "Бонусным действием в свои последующие ходы"],
    ["на 1d8 за каждые два уровня ячейки выше 2-го", "на 1d8 за каждый уровень ячейки выше 2-го"],
  ]],
]);

function parseField(line, label, name) {
  const prefix = `**${label}:** `;
  if (!line?.startsWith(prefix) || !line.slice(prefix.length).trim()) {
    throw new Error(`У заклинания «${name}» отсутствует поле «${label}»`);
  }
  return line.slice(prefix.length).trim();
}

export async function importSpells(read) {
  const [chapter, glossary] = await Promise.all([read("07_Spells.md"), read("14_Glossary/02_Spells.md")]);
  const index = new Map();
  const rows = glossary.split(/\r?\n/).filter(line => line.startsWith("| ")).slice(1);
  for (const row of rows) {
    const [name, englishName, tier, school, classes] = row.trim().slice(1, -1).split("|").map(cell => cell.trim());
    const level = tier === "Заговор" ? 0 : Number(tier);
    if (!name || !englishName || !school || !classes || !/^(?:Заговор|[1-9])$/.test(tier) || index.has(englishName)) {
      throw new Error("Некорректная запись в глоссарии заклинаний: " + row);
    }
    index.set(englishName, { name, level, school, classes });
  }

  const spells = [];
  const ids = new Set();
  for (const group of chapter.replace(/\r\n/g, "\n").split(/^## /m)) {
    const levelHeading = /^(?:Заговоры \(0-й уровень\)|Заклинания ([1-9])-го уровня)\n/.exec(group);
    if (!levelHeading) continue;
    const level = Number(levelHeading[1] ?? 0);
    for (const block of group.split(/^### /m).slice(1)) {
      const [heading, subtitle, timeLine, rangeLine, componentLine, durationLine, ...effect] = block.trim().split(/\n[ \t]*\n/);
      const names = /^(.+) \(([^()]+)\)$/.exec(heading);
      const englishName = names?.[2];
      const entry = index.get(englishName);
      if (!entry || entry.name !== names[1] || entry.level !== level || !subtitle?.startsWith("*") || !effect.length) {
        throw new Error("Описание заклинания расходится с указателем: " + heading);
      }
      const { name, school, classes } = entry;
      const id = englishName.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!id || ids.has(id)) throw new Error("Неоднозначный идентификатор заклинания: " + englishName);
      ids.add(id);
      const castingTime = parseField(timeLine, "Время накладывания", name);
      const range = parseField(rangeLine, "Дистанция", name);
      const originalComponents = parseField(componentLine, "Компоненты", name);
      const components = componentCorrections.get(englishName) ?? originalComponents;
      const duration = parseField(durationLine, "Длительность", name);
      let description = effect.join("\n\n");
      for (const [original, corrected] of effectCorrections.get(englishName) ?? []) {
        if (!description.includes(original)) throw new Error("Проверьте поправку к тексту заклинания: " + name);
        description = description.replace(original, corrected);
      }
      if (/!\[|\]\(|<\/?[a-z][\w:-]*(?:\s|\/?>)|https?:\/\//i.test(description)) {
        throw new Error("Описание заклинания содержит разметку, требующую проверки: " + name);
      }
      const body = `**Классы:** ${classes}\n\n${description}`;
      spells.push({ id, name, englishName, level, school, castingTime, range, duration, components, body });
    }
  }
  if (spells.length !== 339 || spells.length !== index.size) {
    throw new Error("Не совпало число заклинаний в SRD 5.2.1 и русском глоссарии");
  }
  return spells;
}
