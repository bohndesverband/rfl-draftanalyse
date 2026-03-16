<template>
	<router-view />

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

import Alert from "@/components/atoms/Alert.vue";

import { onMounted } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();

//
// Functions
//
// ========================================================================

onMounted(async () => {
	await supabaseData.getSession();
	await supabaseData.fetchRflTeams();
	await supabaseData.fetchRflDrafts();
});
</script>
