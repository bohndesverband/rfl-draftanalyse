<template>
	<Button
		v-if="supabaseData.currentUser"
		:button="{
			class: 'uk-position-top-right uk-position-medium',
			label: 'Logout',
		}"
		@click="logout"
	/>

	<SignIn v-if="!supabaseData.currentUser" />

	<Edit v-else />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Button from "@/components/atoms/Button.vue";
import SignIn from "@/components/organisms/SignIn.vue";
import Edit from "@/components/organisms/Edit.vue";

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

const logout = async () => {
	await supabaseData.signOut();
};
</script>

<style lang="scss"></style>
