<template>
	<SignIn v-if="!supabaseData.currentUser" />
	<router-view v-else />

	<Alert
		v-if="supabaseData.alertMessage"
		class="uk-position-bottom-right uk-position-medium"
		:message="supabaseData.alertMessage"
		:type="supabaseData.alertType"
	/>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import SignIn from "@/components/organisms/SignIn.vue";
import Alert from "@/components/atoms/Alert.vue";

import { onMounted, ref, watch } from "vue";
import { useSupabaseStore } from "@/store/supabase";
import { useRouter } from "vue-router";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const trades = ref([]);
const router = useRouter();

//
// Functions
//
// ========================================================================

onMounted(async () => {
	await supabaseData.getSession();
	await supabaseData.fetchRflTeams();
	await supabaseData.fetchRflDrafts();
});

watch(
	() => supabaseData.currentUser,
	() => {
		if (!supabaseData.currentUser) {
			router.push("/signin");
		}
	},
);
</script>
