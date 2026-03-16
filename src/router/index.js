import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import SignUp from "@/views/SignUp.vue";

const routes = [
	{
		path: "/",
		name: "home",
		component: Home,
	},
	{
		path: "/registrieren",
		name: "signup",
		component: SignUp,
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
