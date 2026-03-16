<template>
	<pre>{{ supabaseData.currentUser }}</pre>
	<Button
		v-if="supabaseData.currentUser"
		:button="{
			class: 'uk-position-top-right uk-position-medium',
			label: 'Logout',
		}"
		@click="logout"
	/>

	<SignIn v-if="!supabaseData.currentUser" />

	<Edit />

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

import Button from "@/components/atoms/Button.vue";
import SignIn from "@/components/organisms/SignIn.vue";
import Edit from "@/components/organisms/Edit.vue";
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

const logout = async () => {
	await supabaseData.signOut();
};
</script>
