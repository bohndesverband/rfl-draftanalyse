<template>
	<UploadForm v-if="supabaseData.filteredPick == 'trades'" />
	<Form :fields="formFields" @submit="submitForm" @reset="cancelForm" />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";
import { reactive, ref, watch } from "vue";
import { useSupabaseStore } from "@/store/supabase";
import UploadForm from "@/components/organisms/forms/UploadForm.vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	data: {
		type: Object,
		required: false,
	},
});

const supabaseData = useSupabaseStore();

const formFields = reactive({
	year: {
		label: "Analyse Jahr",
		type: "select",
		value: "",
		required: true,
		options: [
			{
				text: "Bitte wählen",
				value: "",
				disabled: true,
			},
			{
				text: "nach dem Draft",
				value: "0",
			},
			{
				text: "nach dem 1. Jahr",
				value: "1",
			},
			{
				text: "nach dem 3. Jahr",
				value: "3",
			},
			{
				text: "nach dem 5. Jahr",
				value: "5",
			},
		],
	},
	text: {
		label: "Analyse",
		type: "textarea",
		value: "",
		required: true,
		width: "uk-width-1-1",
		rows: 15,
	},
	grade: {
		label: "Note",
		type: "",
		value: "",
	},
	delete: {
		label: "Löschen",
		type: "submit",
		width: "uk-width-1-2@s",
		class: "uk-button-danger",
		disabled: true,
	},
	submit: {
		label: "Speichern",
		type: "submit",
		width: "uk-width-1-2@s uk-flex uk-flex-right",
		class: "uk-button-primary",
	},
	// reset: {
	// 	label: "Abbrechen",
	// 	type: "reset",
	// 	width: "uk-width-1-1",
	// 	class: "uk-button-muted uk-width-1-1",
	// },
});

//
// Functions
//
// ========================================================================

watch(
	() => supabaseData.currentAnalysis,
	(analysis) => {
		formFields.year.value = analysis?.year?.toString() || "";
		formFields.text.value = analysis?.text || "";
		formFields.grade.value = analysis?.grade || "";
	},
	{ deep: true, immediate: true },
);

const submitForm = async (formData) => {
	if (formData.id === "submit") {
		let pick = supabaseData.filteredPick;

		if (supabaseData.filteredPick == "trades") {
			if (supabaseData.currentAnalysis.pick) {
				pick = supabaseData.currentAnalysis.pick;
			} else {
				const now = new Date().valueOf();
				pick = `trade_${now}`;
			}
		}

		await supabaseData
			.upsertAnalysis({
				id: supabaseData.currentAnalysis?.id || undefined,
				draft_class: supabaseData.filteredDraftClass,
				team_id: supabaseData.filteredTeam,
				pick: pick,
				year: formData.fields.year.value,
				text: formData.fields.text.value,
				grade: formData.fields.grade.value,
				user_id: supabaseData.currentUser.id,
				last_update: new Date().toISOString(),
			})
			.then(() => {
				supabaseData.readAnalysis(
					supabaseData.filteredDraftClass,
					supabaseData.filteredTeam,
					pick,
				);
				supabaseData.currentAnalysis = null;
				supabaseData.showEditCard = false;
			});
	} else if (formData.id === "delete") {
		// TODO: Löschen
		console.log("Löschen");
	}
};

const cancelForm = () => {
	console.log("cancel");

	supabaseData.currentAnalysis = null;
	supabaseData.showEditCard = false;
};
</script>

<style lang="scss"></style>
