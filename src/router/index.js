import { createRouter, createWebHashHistory } from "vue-router";

import SignUp from "@/views/SignUp.vue";
import Overview from "@/views/Overview.vue";
import Edit from "@/views/Edit.vue";

const routes = [
	{
		path: "/registrieren",
		name: "signup",
		component: SignUp,
	},
	{
		path: "/",
		name: "overview",
		component: Overview,
	},
	{
		path: "/edit/:year/:id",
		name: "edit",
		component: Edit,
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
