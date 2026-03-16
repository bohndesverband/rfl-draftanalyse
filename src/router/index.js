import { createRouter, createWebHashHistory } from "vue-router";

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
	{
		// 404
		path: "/:pathMatch(.*)*",
		redirect: "/",
	},
];

const router = createRouter({
	history: createWebHashHistory(),
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
