<script setup lang="ts">
import { computed } from "vue";
import type { Monster, Spell } from "../data/catalog";
import ReferenceBody from "./ReferenceBody.vue";

const props = defineProps<{ entry: Monster | Spell; detail?: boolean }>();
const emit = defineEmits<{ open: [event: MouseEvent]; close: [] }>();
const srdPdf = "https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf";

const facts = computed(() => {
  const entry = props.entry;
  if (entry.kind === "monster") {
    return [
      { label: "Размер", value: entry.size },
      { label: "Класс доспеха", value: entry.armorClass },
      { label: "Хиты", value: entry.hitPoints },
    ];
  }
  return [
    { label: "Время накладывания", value: entry.castingTime },
    { label: "Дистанция", value: entry.range },
    { label: "Длительность", value: entry.duration },
    { label: "Компоненты", value: entry.components },
  ];
});
</script>

<template>
  <article class="reference-entry" :class="{ 'entry-detail': detail }" :aria-labelledby="detail ? undefined : `entry-${entry.id}`">
    <header class="entry-heading">
      <div class="entry-classification">
        <template v-if="entry.kind === 'monster'">
          <span>{{ entry.type }}</span>
          <span>{{ entry.challenge === "Нет" ? "Без показателя опасности" : "Опасность " + entry.challenge }}</span>
        </template>
        <template v-else>
          <span>{{ entry.school }}</span>
          <span>{{ entry.level === 0 ? "Заговор" : `${entry.level}-й уровень` }}</span>
        </template>
      </div>
      <h2 v-if="detail" :id="`detail-${entry.kind}-${entry.id}`">{{ entry.name }}</h2>
      <h2 v-else :id="`entry-${entry.id}`">
        <button type="button" aria-haspopup="dialog" :aria-controls="`dialog-${entry.kind}`" @click="emit('open', $event)">
          {{ entry.name }}
        </button>
      </h2>
      <button v-if="detail" type="button" class="close-detail" @click="emit('close')">Закрыть</button>
    </header>
    <div
      :class="{ 'detail-content': detail }"
      :tabindex="detail ? 0 : undefined"
      :role="detail ? 'region' : undefined"
      :aria-label="detail ? 'Описание' : undefined"
    >
      <dl v-if="!detail || entry.kind === 'spell'" class="entry-facts">
        <div v-for="fact in facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
      <template v-if="detail">
        <p class="original-name">
          <span lang="en">{{ entry.englishName }}</span>
          <a v-if="entry.kind === 'monster'" :href="`${srdPdf}#page=${entry.sourcePage}`" target="_blank" rel="noopener noreferrer">
            SRD 5.2.1, с. {{ entry.sourcePage }}
          </a>
        </p>
        <ReferenceBody :body="entry.body" />
      </template>
    </div>
  </article>
</template>

<style scoped>
.reference-entry {
  position: relative;
  height: 100%;
  padding: clamp(1rem, 2.6vw, 1.65rem);
  border: 1px solid var(--sheet-line);
  border-radius: var(--sheet-radius);
  background-color: var(--sheet-panel);
  color: var(--color-primary-1000);
  overflow-wrap: anywhere;
}

.reference-entry:not(.entry-detail):is(:hover, :focus-within) {
  border-color: var(--color-secondary-1000);
  background-color: #fffaf1;
}

.entry-detail {
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 0;
  padding: 0;
  border: 0;
}
.entry-detail .entry-heading {
  flex: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: .35rem 1rem;
  padding: clamp(.85rem, 2.5vw, 1.5rem);
  border-bottom: 1px solid var(--sheet-line);
  background: linear-gradient(110deg, #fbefda, #f2e2c6);
}
.entry-detail .entry-classification { grid-column: 1; justify-content: start; }
.entry-detail h2 { grid-column: 1; margin: 0; }
.close-detail {
  grid-column: 2;
  grid-row: 1 / 3;
  min-height: var(--sheet-control-height);
  padding: .5rem 1rem;
  border: 1px solid var(--color-secondary-1000);
  border-radius: var(--sheet-radius);
  background-color: var(--sheet-panel);
  color: var(--color-secondary-text);
  cursor: pointer;
}
.close-detail:hover { background: #efe0c2; }
.detail-content {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: clamp(1rem, 2.5vw, 1.5rem);
}
.detail-content:focus-visible { outline: 2px solid var(--color-primary-950); outline-offset: -3px; }
.entry-classification {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25rem 0.75rem;
  color: var(--color-primary-950);
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.04em;
}

h2 {
  margin: 0.4rem 0 0.875rem;
  font-family: var(--font-serif);
  font-size: clamp(1.45rem, 2vw, 1.85rem);
  font-weight: 600;
  line-height: 1.18;
}
.entry-detail h2 { color: var(--color-burgundy); }

.entry-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
  gap: 0.65rem 1rem;
  padding-top: .8rem;
  border-top: 1px solid var(--sheet-line);
  margin: 0;
}
.entry-detail .entry-facts { border-top: 0; padding-top: 0; padding-bottom: .8rem; }

.entry-facts dt {
  font-size: 0.78rem;
  color: var(--color-secondary-text);
}

.entry-facts dd {
  margin: 0.2rem 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
}

h2 button {
  display: flex;
  align-items: baseline;
  gap: .5rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: start;
}
h2 button::after {
  content: "";
  flex: none;
  width: .35em;
  height: .35em;
  margin-inline-start: auto;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  color: var(--color-burgundy);
  transform: translateY(-.15em) rotate(-45deg);
}
h2 button::before { content: ""; position: absolute; inset: 0; }
h2 button:focus-visible, .close-detail:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.original-name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: .25rem 1rem;
  margin: .3rem 0 1rem;
  color: var(--color-secondary-text);
}
.original-name a { text-decoration: underline; text-underline-offset: .15em; }
@media (max-width: 24rem) {
  .entry-detail .entry-heading { gap: .3rem .65rem; }
  .close-detail { padding-inline: .7rem; }
}
</style>
