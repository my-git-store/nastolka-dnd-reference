<script setup lang="ts">
import { computed, nextTick, onDeactivated, onMounted, ref, shallowRef } from "vue";
import { NButton } from "naive-ui/es/button";
import { NInput, type InputInst } from "naive-ui/es/input";
import { loadCatalog, type CatalogSection, type Monster, type Spell } from "../data/catalog";
import ReferenceEntry from "../components/ReferenceEntry.vue";

const props = defineProps<{ section: CatalogSection }>();
const catalog = shallowRef<(Monster | Spell)[]>([]);
const state = ref<"loading" | "ready" | "error">("loading");
const query = ref("");
const searchInput = ref<InputInst | null>(null);
const appliedQuery = ref("");
const spellLevel = ref<number | "all">("all");
const selectedEntry = shallowRef<Monster | Spell | null>(null);
const detailDialog = ref<HTMLDialogElement | null>(null);
let pressedBackdrop = false;
const title = computed(() => props.section === "monsters" ? "Монстры" : "Заклинания");
const inputId = computed(() => `reference-search-${props.section}`);
const entries = computed(() => catalog.value.filter(entry => {
  if (entry.kind === "spell" && spellLevel.value !== "all" && entry.level !== spellLevel.value) return false;
  if (!appliedQuery.value) return true;
  return matchesName(entry.name) || matchesName(entry.englishName) ||
    (entry.kind === "monster" && entry.aliases?.some(matchesName));
}));

function matchesName(name: string) {
  return normalizeName(name).includes(appliedQuery.value);
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase("ru").replace(/ё/g, "е");
}

async function load() {
  state.value = "loading";
  try {
    catalog.value = await loadCatalog(props.section);
    state.value = "ready";
  } catch {
    state.value = "error";
  }
}

onMounted(load);

async function openDetails(entry: Monster | Spell, event: MouseEvent) {
  if (event.currentTarget instanceof HTMLButtonElement) event.currentTarget.focus({ preventScroll: true });
  selectedEntry.value = entry;
  await nextTick();
  if (selectedEntry.value && detailDialog.value?.isConnected && !detailDialog.value.open) detailDialog.value.showModal();
}

function closeDetails() {
  detailDialog.value?.close();
}

function clearClosedEntry() {
  if (!detailDialog.value?.open) selectedEntry.value = null;
}

function rememberPointerDown(event: PointerEvent) {
  pressedBackdrop = event.target === event.currentTarget;
}

function dismissBackdrop() {
  if (pressedBackdrop) closeDetails();
}

function wrapDialogFocus(event: KeyboardEvent) {
  const controls = detailDialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
  if (!controls?.length) return;
  const first = controls[0];
  const last = controls[controls.length - 1];
  const boundary = event.shiftKey ? first : last;
  if (document.activeElement === boundary) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
}

onDeactivated(() => {
  closeDetails();
  selectedEntry.value = null;
});

function updateQuery(value: string) {
  query.value = value;
  if (!value.trim()) appliedQuery.value = "";
}

function search() {
  appliedQuery.value = normalizeName(query.value);
}

function clearSearch() {
  updateQuery("");
  searchInput.value?.focus();
}
</script>

<template>
  <section class="reference-section">
    <h1>{{ title }}</h1>
    <p class="catalog-note">Правила 2024 года · SRD 5.2.1. Поиск по русскому или английскому названию.</p>
    <form class="reference-search" role="search" @submit.prevent="search">
      <div class="reference-search-controls" :class="{ 'spell-search': section === 'spells' }">
        <div class="search-field">
          <label :for="inputId">Поиск по названию</label>
          <NInput
            ref="searchInput"
            :value="query"
            :input-props="{ id: inputId, autocomplete: 'off', enterkeyhint: 'search' }"
            placeholder=""
            @update:value="updateQuery"
          >
            <template #suffix>
              <button v-if="query" type="button" class="clear-search" @click="clearSearch">
                Очистить
              </button>
            </template>
          </NInput>
        </div>
        <div v-if="section === 'spells'" class="search-field">
          <label for="reference-spell-level">Уровень заклинания</label>
          <select id="reference-spell-level" v-model="spellLevel">
            <option value="all">Все уровни</option>
            <option :value="0">Заговоры</option>
            <option v-for="level in 9" :key="level" :value="level">{{ level }}-й уровень</option>
          </select>
        </div>
        <NButton type="primary" attr-type="submit">Найти</NButton>
      </div>
    </form>
    <p v-if="state === 'loading'" class="result-status" role="status">Загружаем каталог…</p>
    <div v-else-if="state === 'error'" class="result-status">
      <p role="alert">Не удалось загрузить каталог. Проверьте соединение и попробуйте ещё раз.</p>
      <NButton @click="load">Повторить</NButton>
    </div>
    <p v-else class="result-status" role="status" aria-atomic="true">
      {{ entries.length ? `Записей: ${entries.length}` : "Ничего не найдено" }}
    </p>
    <ul v-if="entries.length" class="entry-list" :aria-label="title">
      <li v-for="entry in entries" :key="entry.id">
        <ReferenceEntry :entry="entry" @open="openDetails(entry, $event)" />
      </li>
    </ul>
    <dialog
      ref="detailDialog"
      :id="section === 'monsters' ? 'dialog-monster' : 'dialog-spell'"
      class="reference-dialog"
      :aria-labelledby="selectedEntry ? `detail-${selectedEntry.kind}-${selectedEntry.id}` : undefined"
      @close="clearClosedEntry"
      @pointerdown="rememberPointerDown"
      @click.self="dismissBackdrop"
      @keydown.tab="wrapDialogFocus"
    >
      <ReferenceEntry v-if="selectedEntry" :entry="selectedEntry" detail @close="closeDetails" />
    </dialog>
  </section>
</template>

<style scoped>
.reference-section {
  min-width: 0;
  color: var(--color-primary-1000);
}

h1 {
  margin: 0;
  color: var(--color-burgundy);
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 600;
  line-height: 1.1;
}

.reference-search {
  padding: clamp(.9rem, 2vw, 1.25rem);
  border: 1px solid var(--sheet-line);
  border-radius: var(--sheet-radius);
  background: var(--sheet-panel);
}

.catalog-note {
  margin: .65rem 0 1.35rem;
  color: var(--color-secondary-text);
}

.reference-search label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--color-primary-950);
  font-size: 0.9rem;
  font-weight: 600;
}

.reference-search-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.625rem;
  max-width: 36rem;
}

.reference-search-controls.spell-search {
  grid-template-columns: minmax(0, 1fr) auto auto;
  max-width: 44rem;
}

.search-field { min-width: 0; }

.search-field select {
  min-height: var(--sheet-control-height);
  width: 100%;
  padding-inline: .65rem;
  border: 1px solid var(--color-accent);
  border-radius: var(--sheet-input-radius);
  background-color: #fffcf5;
  color: var(--color-primary-1000);
  font: inherit;
}

.search-field select:focus-visible,
.reference-search-controls :deep(.n-input:focus-within),
.reference-search-controls :deep(button:focus-visible) {
  outline: 2px solid var(--color-primary-950);
  outline-offset: 2px;
}

.clear-search {
  cursor: pointer;
  color: var(--color-primary-950);
  padding: .15rem;
  border: 0;
  background: none;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: .15em;
}

.result-status {
  margin: 1rem 0 0.7rem;
  font-size: 0.9rem;
  color: var(--color-secondary-text);
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry-list li {
  min-width: 0;
}

.reference-dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(46rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--color-secondary-1000);
  border-radius: var(--sheet-radius);
  background: var(--sheet-panel);
  color: var(--color-primary-1000);
  box-shadow: 0 1rem 3rem rgba(65, 39, 27, .35);
}

.reference-dialog[open] { display: flex; flex-direction: column; }
.reference-dialog::backdrop { background: rgb(36 21 29 / 55%); }
:global(html:has(dialog.reference-dialog[open])) { overflow: hidden; }

@media (max-width: 30rem) {
  .reference-search-controls, .reference-search-controls.spell-search {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
