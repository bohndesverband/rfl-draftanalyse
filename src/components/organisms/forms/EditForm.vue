<template>
	<div class="uk-background-default uk-padding-small">
		<h3 class="uk-h4">Analyse bearbeiten</h3>
		<Form :fields="formFields" @submit="submitForm" @reset="emit('reset')" />
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";
import { reactive } from "vue";
import { useSupabaseStore } from "@/store/supabase";

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
		value: props.data?.year || "",
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
		value: props.data?.text || "",
		width: "uk-width-1-1",
		rows: 10,
	},
	grade: {
		label: "Note",
		type: "",
		value: props.data?.grade || "",
	},
	delete: {
		label: "Löschen",
		type: "submit",
		width: "uk-width-1-2@s",
		class: "uk-button-danger",
	},
	submit: {
		label: "Speichern",
		type: "submit",
		width: "uk-width-1-2@s uk-flex uk-flex-right",
		class: "uk-button-primary",
	},
	reset: {
		label: "Abbrechen",
		type: "submit",
		width: "uk-width-1-1",
		class: "uk-button-muted uk-width-1-1",
	},
});

const emit = defineEmits(["submit", "reset"]);

//
// Functions
//
// ========================================================================

// watch(
// 	() => supabaseData.currentAnalysis,
// 	(analysis) => {
// 		formFields.year.value = analysis?.year?.toString() || "";
// 		formFields.text.value = analysis?.text || "";
// 		formFields.grade.value = analysis?.grade || "";
// 	},
// 	{ deep: true, immediate: true },
// );

const submitForm = async (formData) => {
	if (formData.id === "submit") {
		let pick = props.data.pick;

		if (!pick && pick == "trade") {
			const now = new Date().valueOf();
			pick = `trade_${now}`;
		}

		await supabaseData
			.upsertAnalysis({
				id: props.data?.id || undefined,
				draft_class: props.data.draft_class || supabaseData.filteredDraftClass,
				team_id: props.data.team_id || supabaseData.filteredTeam,
				pick: pick,
				year: formData.fields.year.value,
				text: formData.fields.text.value,
				grade: formData.fields.grade.value,
				user_id: supabaseData.currentUser.id,
				last_update: new Date().toISOString(),
			})
			.then(() => {
				updateData();
			});

		emit("submit");
	} else if (formData.id === "delete") {
		supabaseData.deleteAnalysis(props.data.id).then(() => {
			updateData();
		});
	}
};

const updateData = () => {
	supabaseData.fetchDraftClassAnalysis(
		supabaseData.filteredDraftClass,
		supabaseData.filteredTeam,
	);
};
</script>

<style lang="scss"></style>
