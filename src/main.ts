import { createApp } from "vue";
import "@fontsource-variable/lora/wght.css";
import "@fontsource-variable/lora/wght-italic.css";
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import App from "./App.vue";
import { router } from "./router";
import "./styles/sheet.css";

createApp(App).use(router).mount("#app");
