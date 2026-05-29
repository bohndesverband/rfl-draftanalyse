<template>
	<div v-if="!supabaseData.currentUser" class="uk-position-center">
		<div class="uk-width-medium uk-margin-medium-bottom">
			<h1>Login</h1>
			<AuthentificationForm />
		</div>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import AuthentificationForm from "@/components/organisms/forms/AuthentificationForm.vue";

import { useSupabaseStore } from "@/store/supabase";
import { watch } from "vue";
import { useRouter } from "vue-router";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const router = useRouter();

//
// Functions
//
// ========================================================================

watch(
	() => supabaseData.currentUser,
	() => {
		if (supabaseData.currentUser) {
			router.push("/overview");
		}
	},
);
</script>

<style lang="scss"></style>
