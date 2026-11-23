<template>
  <header class="intro">
    <h1>Справочник D&amp;D</h1>
    <p>Бестиарий и книга заклинаний по открытым правилам D&amp;D 2024 года (SRD 5.2.1). В каждом разделе можно найти запись по названию и раскрыть её полный текст.</p>
  </header>
  <nav class="sections" aria-label="Разделы справочника">
    <RouterLink :to="{ name: 'ReferenceMonsters' }">
      <h2>Монстры</h2>
      <p>336 существ, от паука до древнего дракона. Характеристики, особенности и действия, включая существ из магических предметов и заклинаний.</p>
      <span aria-hidden="true">→</span>
    </RouterLink>
    <RouterLink :to="{ name: 'ReferenceSpells' }">
      <h2>Заклинания</h2>
      <p>339 заговоров и заклинаний. Время накладывания, компоненты и полное описание эффектов.</p>
      <span aria-hidden="true">→</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.intro {
  display: grid;
  align-content: center;
  min-height: clamp(12rem, 22vw, 17rem);
  padding: clamp(1.1rem, 4vw, 3.25rem);
  border: 1px solid var(--sheet-line);
  border-radius: var(--sheet-radius);
  background-color: var(--sheet-panel);
  background-image: linear-gradient(90deg, #fff8e9 2%, #fff8e9f2 34%, #fff8e982 62%, #fff8e908 88%), var(--sheet-map);
  background-size: 100% 100%, 110% auto;
  background-position: center, 98% 96%;
  background-repeat: no-repeat;
}
h1, h2 { font-family: var(--font-serif); }
h1 { color: var(--color-burgundy); font-size: clamp(2.1rem, 5vw, 4.15rem); font-weight: 600; line-height: 1.12; }
.intro p {
  max-width: min(35rem, 63%);
  margin-top: 1rem;
  line-height: 1.7;
}
p { color: var(--color-secondary-text); }
.sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
  margin-top: clamp(1rem, 3vw, 1.75rem);
}
.sections a {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-content: start;
  gap: .75rem 1rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--sheet-panel);
  border: 1px solid var(--sheet-line);
  border-inline-start: 3px solid var(--color-secondary-1000);
  border-radius: var(--sheet-radius);
  color: var(--color-primary-1000);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.sections a:hover { border-color: var(--color-burgundy); background-color: #fffaf1; }
.sections h2 { font-size: 1.7rem; line-height: 1.25; }
.sections p { grid-column: 1 / -1; line-height: 1.65; }
.sections span {
  align-self: start;
  color: var(--color-burgundy);
  grid-column: 2;
  grid-row: 1;
  font-size: 1.4rem;
}
@media (max-width: 36rem) {
  .intro {
    align-content: start;
    padding-bottom: 4rem;
    background-image: linear-gradient(170deg, #fff8e9 4%, #fff8e9ea 48%, #fff8e92b 88%), var(--sheet-map);
    background-position: center, 92% 99%;
  }
  .intro p { max-width: 100%; }
}
</style>
