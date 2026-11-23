import { createRouter, createWebHistory } from "vue-router";
import ReferenceLayout from "./modules/public/reference/ReferenceLayout.vue";

const sectionView = () => import("./modules/public/reference/views/ReferenceSection.vue");

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "ReferenceHome" } },
    {
      path: "/reference",
      component: ReferenceLayout,
      children: [
        {
          path: "",
          name: "ReferenceHome",
          component: () => import("./modules/public/reference/views/ReferenceHome.vue"),
        },
        {
          path: "monsters",
          name: "ReferenceMonsters",
          component: sectionView,
          props: { section: "monsters" },
          meta: { title: "Монстры" },
        },
        {
          path: "spells",
          name: "ReferenceSpells",
          component: sectionView,
          props: { section: "spells" },
          meta: { title: "Заклинания" },
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "ReferenceHome" } },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

router.afterEach(route => {
  document.title = route.meta.title ? `${route.meta.title} · Справочник D&D` : "Справочник D&D · Настолка";
});
