<script lang="ts">
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false, linkify: false });
const rules = markdown.renderer.rules;

// The catalogue provides the text of a link or illustration, without navigating
// to the source site or fetching its media.
rules.link_open = rules.link_close = () => "";
rules.image = (tokens, index, options, env, renderer) =>
  renderer.renderInline(tokens[index]?.children ?? [], options, env);

rules.table_open = () =>
  '<div class="reference-table" role="region" aria-label="Таблица" tabindex="0"><table>\n';
rules.table_close = () => "</table></div>\n";
rules.th_open = (tokens, index, options, _env, renderer) => {
  tokens[index]?.attrSet("scope", "col");
  return renderer.renderToken(tokens, index, options);
};
</script>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ body: string }>();
const html = computed(() => markdown.render(props.body));
</script>

<template>
  <div class="reference-body" v-html="html" />
</template>

<style scoped>
.reference-body {
  min-width: 0;
  color: var(--color-primary-1000);
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.reference-body :deep(* + :is(p, ul, ol, blockquote, pre, .reference-table)) {
  margin-block-start: .65rem;
}
.reference-body :deep(:is(h1, h2, h3, h4, h5, h6)) {
  margin-block: 1.2rem .35rem;
  font: 600 1.15rem/1.35 var(--font-serif);
}
.reference-body :deep(ul), .reference-body :deep(ol) { padding-inline-start: 1.5rem; }
.reference-body :deep(ul) { list-style: disc; }
.reference-body :deep(ol) { list-style: decimal; }
.reference-body :deep(strong) { font-weight: 700; }
.reference-body :deep(em) { font-style: italic; }
.reference-body :deep(blockquote) {
  border-inline-start: 3px solid var(--color-accent);
  padding-inline-start: .9rem;
}
.reference-body :deep(pre) { white-space: pre-wrap; }
.reference-body :deep(.reference-table) {
  max-width: 100%;
  overflow-x: auto;
}
.reference-body :deep(.reference-table:focus-visible) {
  outline: 2px solid var(--color-primary-950);
  outline-offset: 2px;
}
.reference-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: .92rem;
}
.reference-body :deep(:is(th, td)) {
  min-width: 4rem;
  border: 1px solid var(--color-accent);
  padding: .35rem .55rem;
  text-align: start;
  vertical-align: top;
}
.reference-body :deep(th) { background: #efe0c2; }
</style>
