<template>
	<Form :fields="formFields" @submit="submitForm" />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";

import { reactive, ref } from "vue";
import { supabase } from "@/js/supabase";
import { useRouter } from "vue-router";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const formFields = reactive({
	email: {
		label: "E-Mail",
		type: "email",
		autocomplete: "usermail",
		required: true,
	},
	password: {
		label: "Passwort",
		type: "password",
		autocomplete: "current-password",
		required: true,
	},
	submit: {
		label: "Login",
		type: "submit",
		class: "uk-button-primary",
	},
});

const router = useRouter();
const supabaseData = useSupabaseStore();

//
// Functions
//
// ========================================================================

const submitForm = async (formData) => {
	const { error, data } = await supabase.auth.signInWithPassword({
		email: formData.fields.email.value,
		password: formData.fields.password.value,
	});

	if (error) {
		console.error("Login error:", error);
		return;
	}

	await supabaseData.getCurrentUser();
	router.push("/edit");
};
</script>

<style lang="scss"></style>
