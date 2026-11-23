interface ReferenceRecord {
  readonly id: string;
  readonly name: string;
  readonly englishName: string;
  readonly body: string;
}

export interface Monster extends ReferenceRecord {
  readonly kind: "monster";
  readonly aliases?: readonly string[];
  readonly sourcePage: number;
  readonly size: string;
  readonly type: string;
  readonly challenge: string;
  readonly armorClass: number | string;
  readonly hitPoints: number | string;
}

export interface Spell extends ReferenceRecord {
  readonly kind: "spell";
  readonly level: number;
  readonly school: string;
  readonly castingTime: string;
  readonly range: string;
  readonly duration: string;
  readonly components: string;
}

export type CatalogSection = "monsters" | "spells";

export async function loadCatalog(section: CatalogSection): Promise<(Monster | Spell)[]> {
  const collator = new Intl.Collator("ru");
  const entries = section === "monsters"
    ? (await import("./monsters.json")).default.map(row => ({ ...row, kind: "monster" as const }))
    : (await import("./spells.json")).default.map(row => ({ ...row, kind: "spell" as const }));
  return entries.sort((a, b) => collator.compare(a.name, b.name));
}
