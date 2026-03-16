import { createRouter, createWebHistory } from "vue-router";

import Edit from "@/views/Edit.vue";
import SignIn from "@/views/SignIn.vue";

const routes = [
	{
		path: "/",
		name: "signIn",
		component: SignIn,
	},
	{
		path: "/edit",
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
