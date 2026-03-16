<template>
	<Form
		:fields="formFields"
		:formErrorMessage="formErrorMessage"
		@submit="submitForm"
	/>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";

import { reactive, ref } from "vue";
import { supabase } from "@/js/supabase";
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

const supabaseData = useSupabaseStore();
const formErrorMessage = ref("");

//
// Functions
//
// ========================================================================

const submitForm = async (formData) => {
	console.log("🚀 ~ submitForm ~ formData:", formData);

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: formData.fields.email.value,
			password: formData.fields.password.value,
		});
		console.log("🚀 ~ submitForm ~ data:", data);

		if (error) throw error;

		await supabaseData.getSession();
	} catch (error) {
		formErrorMessage.value = error.message;
		return;
	}
};
</script>

<style lang="scss"></style>
