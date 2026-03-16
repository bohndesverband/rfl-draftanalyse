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

const props = defineProps({
	type: {
		type: String,
		default: "Login",
	},
});

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
		label: props.type,
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
	try {
		if (props.type === "Registrieren") {
			await supabaseData.registerUser(
				formData.fields.email.value,
				formData.fields.password.value,
			);
		} else {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: formData.fields.email.value,
				password: formData.fields.password.value,
			});

			if (error) throw error;

			await supabaseData.getSession();
		}
	} catch (error) {
		formErrorMessage.value = error.message;
		return;
	}
};
</script>

<style lang="scss"></style>
