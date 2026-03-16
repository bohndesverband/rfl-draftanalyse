<template>
	<div class="js-upload uk-placeholder uk-text-center">
		<Form
			:fields="formFields"
			:formSuccessMessage="formSuccessMessage"
			@submit="uploadFile"
		/>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";
import { useSupabaseStore } from "@/store/supabase";
import { ref } from "vue";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const formFields = {
	file: {
		type: "file",
		value: "",
		required: true,
	},
	submit: {
		label: "Hochladen",
		type: "submit",
	},
};

const formSuccessMessage = ref("");

//
// Functions
//
// ========================================================================

const uploadFile = (formData) => {
	supabaseData.uploadFile(formData.fields.file);
	formSuccessMessage.value = "Datei erfolgreich hochgeladen.";
};
</script>

<style lang="scss"></style>
