<script setup lang="ts">
import { NConfigProvider } from 'naive-ui/es/config-provider'
import ruRU from 'naive-ui/es/locales/common/ruRU'
import { useRoute } from 'vue-router'
import { sheetTheme } from '../../../styles/sheetTheme'

const route = useRoute()
</script>

<template>
  <NConfigProvider :locale="ruRU" :theme-overrides="sheetTheme">
    <div class="reference" lang="ru">
      <div class="folio">
        <header class="masthead">
          <div class="breadcrumbs">
            <strong class="platform">Настолка</strong>
            <span aria-hidden="true">/</span>
            <RouterLink :to="{ name: 'ReferenceHome' }">Справочник D&amp;D</RouterLink>
          </div>
          <nav v-if="route.name !== 'ReferenceHome'" class="section-tabs" aria-label="Вкладки справочника">
            <RouterLink :to="{ name: 'ReferenceMonsters' }">Монстры</RouterLink>
            <RouterLink :to="{ name: 'ReferenceSpells' }">Заклинания</RouterLink>
          </nav>
        </header>
        <main class="reference-content">
          <RouterView v-slot="{ Component, route: current }">
            <KeepAlive include="ReferenceSection">
              <component :is="Component" :key="current.name" />
            </KeepAlive>
          </RouterView>
        </main>
        <footer class="credits">
          <p><a href="https://dtf.ru/boardgames/3178418-reliz-perevoda-knigi-igroka-2024">Книга игрока 2024 — страница русского перевода Koroz</a></p>
          <p>
            Справочник составлен по <a href="https://www.dndbeyond.com/srd">открытым правилам D&amp;D (SRD 5.2.1)</a>
            Wizards of the Coast. Перевод правил — <a href="https://rules.omnisgm.com">OmnisGM</a>.
          </p>
        </footer>
      </div>
    </div>
  </NConfigProvider>
</template>

<style scoped>
.reference {
  min-height: 100vh;
  padding: clamp(1.25rem, 4vw, 3.75rem) clamp(.75rem, 3vw, 3rem);
  color: var(--color-primary-1000);
}
.folio {
  --folio-gutter: clamp(1rem, 4vw, 3rem);
  position: relative;
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--folio-gutter);
  border: 1px solid var(--sheet-line);
  border-radius: 18px;
  background: rgba(255, 250, 239, .87);
  box-shadow: var(--sheet-shadow);
}
.folio::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(152, 115, 65, .22);
  border-radius: 14px;
  pointer-events: none;
}
.masthead, .breadcrumbs, .section-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.masthead {
  align-items: end;
  justify-content: space-between;
  gap: .5rem 1.25rem;
  padding-top: clamp(.65rem, 2vw, 1.3rem);
  border-bottom: 1px solid var(--sheet-line);
}
.breadcrumbs { gap: .35rem .8rem; padding-block: .45rem .75rem; }
.breadcrumbs span { color: var(--color-secondary-1000); }
.platform { color: var(--color-burgundy); font: 700 1.35rem var(--font-serif); }
.breadcrumbs a { color: var(--color-primary-950); text-decoration-color: var(--sheet-line); }
.breadcrumbs a:hover { text-decoration: underline; }
.section-tabs { gap: .4rem; }
.section-tabs a {
  display: grid;
  min-height: 2.75rem;
  place-items: center;
  padding: .5rem clamp(.8rem, 2vw, 1.6rem);
  border: 1px solid var(--sheet-line);
  border-bottom: 0;
  border-radius: .5rem .5rem 0 0;
  background: #f4e8d1;
  color: var(--color-primary-950);
  font: 600 1rem/1.35 var(--font-serif);
  text-decoration: none;
}
.section-tabs a:hover { background: #e6cea6; }
.section-tabs a[aria-current="page"] {
  background: var(--color-burgundy);
  border-color: var(--color-burgundy);
  color: #fff8e9;
  box-shadow: inset 0 3px #d6af70;
}
.reference :deep(a:focus-visible) {
  outline: 2px solid var(--color-primary-950);
  outline-offset: 3px;
}
.reference-content { padding-block: clamp(1.5rem, 3.7vw, 3rem); }
.credits {
  display: grid;
  gap: .4rem;
  padding-block: .9rem 1.25rem;
  border-top: 1px solid var(--color-accent);
  color: var(--color-primary-950);
  font-size: .85rem;
}
.credits a { text-decoration: underline; text-underline-offset: .17em; }

@media (max-width: 38rem) {
  .masthead { flex-direction: column; align-items: stretch; }
  .section-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
