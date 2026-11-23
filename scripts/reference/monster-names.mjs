// Keep stable SRD identifiers. The primary label follows Russian tabletop usage;
// variants from the licensed translation and common alternatives remain searchable.
const names = {
  "blink-dog": "Мерцающий пёс",
  drider: "Драук",
  roper: "Верёвочник",
  tarrasque: "Тараск",
  "ochre-jelly": "Золотистый студень",
  "axe-beak": "Топороклюв",
  "shield-guardian": "Щитостраж",
  "shrieker-fungus": "Гриб-визгун",
  cockatrice: "Куролиск",
  "pit-fiend": "Исчадие преисподней",
  ape: "Человекообразная обезьяна",
  "giant-ape": "Гигантская человекообразная обезьяна",
};

const alternativeNames = {
  ankheg: ["Анкег"],
  "bugbear-warrior": ["Медвежатник-воин"],
  "bugbear-stalker": ["Медвежатник-охотник"],
  bulette: ["Панцирница", "Булей"],
  "dragon-turtle": ["Драконочерепаха", "Драконовая черепаха"],
  "gelatinous-cube": ["Студенистый куб"],
  ghast: ["Вурдалак"],
  "gibbering-mouther": ["Бормочущий ротовик"],
  imp: ["Бес"],
  owlbear: ["Медвесыч"],
  "purple-worm": ["Лиловый червь"],
  "shambling-mound": ["Ползающая насыпь"],
  stirge: ["Кровопийца"],
  treant: ["Трент"],
  "vampire-spawn": ["Вампирское отродье"],
};

// Match phrases within this creature's own stat block. Other targets mentioned by
// its abilities retain their original gender and conditions.
const bodyTerms = {
  "blink-dog": [["**Языки:** Мерцающий пёс;", "**Языки:** Язык мерцающих псов;"]],
  drider: [
    ["Драйдер", "Драук"], ["драйдер", "драук"],
    ["**_Паучье лазание._** Драук игнорирует ограничения передвижения, вызванные паутиной",
      "**_Хождение по паутине._** Драук игнорирует ограничения передвижения, вызванные паутиной"],
  ],
  roper: [["Веревник", "Верёвочник"], ["веревник", "верёвочник"]],
  "pit-fiend": [
    ["Ямный дьявол", "Исчадие преисподней"], ["ямный дьявол", "исчадие преисподней"],
    ["ямного дьявола", "исчадия преисподней"], ["он мгновенно", "оно мгновенно"],
    ["он может вместо этого", "оно может вместо этого"], ["Он может заменить", "Оно может заменить"],
  ],
  tarrasque: [
    ["Тарраска", "Тараск"], ["тарраска", "тараск"], ["тарраской", "тараском"], ["тарраски", "тараска"],
    ["она может", "он может"],
    ["тараск должна", "тараск должен"], ["внутри неё", "внутри него"],
    ["иначе она извергает", "иначе он извергает"], ["исходящей от неё", "исходящей от него"],
  ],
};

export function localizeMonster(entry) {
  const name = names[entry.id] ?? entry.name;
  const aliases = [...(alternativeNames[entry.id] ?? [])];
  if (name !== entry.name) aliases.unshift(entry.name);
  let body = entry.body;
  for (const [from, to] of bodyTerms[entry.id] ?? []) body = body.replaceAll(from, to);
  return { ...entry, name, ...(aliases.length ? { aliases } : {}), body };
}
