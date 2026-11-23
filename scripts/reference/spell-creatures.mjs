// Four spells in SRD 5.2.1 include their own creature stat block.
export function creaturesFromSpells(spells) {
  const creatures = [];
  for (const spell of spells) {
    const lines = spell.body.split("\n");
    const start = lines.findIndex(line => line.startsWith("> #### "));
    if (start < 0) continue;
    const block = [];
    for (let index = start; index < lines.length && lines[index].startsWith(">"); index++) {
      block.push(lines[index].replace(/^> ?/, ""));
    }
    const names = /^#### (.+) \(([^()]+)\)$/.exec(block.shift());
    const body = block.join("\n").trim();
    const kind = /^\*(Большой|Огромный или меньший) (.+), [^,]+\*$/m.exec(body);
    const armorClass = /^\*\*КД\*\* (.+)$/m.exec(body)?.[1];
    const hitPoints = /^\*\*Хиты\*\* (.+)$/m.exec(body)?.[1];
    if (!names || !kind || !armorClass || !hitPoints || !/^\*\*ПО\*\* Нет(?:\s|$)/m.test(body)) {
      throw new Error("Не удалось разобрать характеристики существа в заклинании «" + spell.name + "»");
    }
    const [, name, englishName] = names;
    creatures.push({
      id: englishName.toLowerCase().replaceAll(" ", "-"), name, englishName,
      size: kind[1], type: kind[2], challenge: "Нет",
      armorClass: /^\d+$/.test(armorClass) ? Number(armorClass) : armorClass,
      hitPoints, body: `**Источник:** заклинание «${spell.name}».\n\n${body}`,
    });
  }
  if (creatures.length !== 4) throw new Error("Проверьте состав существ в главе заклинаний");
  return creatures;
}
