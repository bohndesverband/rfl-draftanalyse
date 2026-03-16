import { createRouter, createWebHistory } from "vue-router";

import Edit from "@/views/Edit.vue";

const routes = [
	{
		path: "/",
		name: "edit",
		component: Edit,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return {
				top: 0,
				behavior: "instant",
			};
		}
	},
});

export default router;
