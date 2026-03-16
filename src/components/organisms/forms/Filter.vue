<template>
	<div class="uk-text-meta uk-text-uppercase uk-margin-small-bottom">
		Draftanalyse suchen
	</div>
	<Form :fields="formFields" @change="updateData" />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";
import { reactive, ref, watch } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const availablePicks = ref([]);
const supabaseData = useSupabaseStore();
const currentYear = new Date().getFullYear();

const formFields = reactive({
	draftClass: {
		label: "Draftklasse",
		type: "select",
		value: "",
		width: "uk-width-1-2@s uk-width-1-3@m",
		options: [
			{
				text: "Bitte ein Jahr wählen",
				value: "",
				disabled: true,
			},
			...Array.from({ length: currentYear - 2022 }, (_, i) => {
				return { value: `${2023 + i}`, text: 2023 + i };
			}),
		],
	},
	team: {
		label: "Team",
		type: "select",
		value: "",
		width: "uk-width-1-2@s uk-width-1-3@m",
		options: [
			{
				text: "Bitte ein Team wählen",
				value: "",
				disabled: true,
			},
		],
	},
	pick: {
		label: "Pick",
		type: "select",
		value: "",
		width: "uk-width-1-3@m",
		options: [
			{
				text: "Bitte einen Pick wählen",
				value: "",
				disabled: true,
			},
		],
	},
});

const previousFieldValues = ref({});

//
// Functions
//
// ========================================================================

const buildTeamOptions = (teams) => {
	if (!Array.isArray(teams)) {
		return [
			{
				text: "Bitte ein Team wählen",
				value: "",
				disabled: true,
			},
		];
	}

	return [
		{
			text: "Bitte ein Team wählen",
			value: "",
			disabled: true,
		},
		...teams.map((team) => {
			return { value: team.team_id, text: team.team_name };
		}),
	];
};

watch(
	() => supabaseData.rflTeams,
	(teams) => {
		formFields.team.options = buildTeamOptions(teams);
	},
	{ immediate: true },
);

const updateData = async (formData) => {
	supabaseData.showEditCard = false;
	const selectedDraftClass = formData.draftClass.value;
	const selectedTeam = formData.team.value;

	if (!Object.keys(previousFieldValues.value).length) {
		previousFieldValues.value = Object.fromEntries(
			Object.entries(formData).map(([fieldKey, field]) => [
				fieldKey,
				field.value,
			]),
		);
		return;
	}

	const changedFieldEntries = Object.entries(formData).filter(
		([fieldKey, field]) => previousFieldValues.value[fieldKey] !== field.value,
	);

	if (!changedFieldEntries.length) {
		return;
	}

	for (const [fieldKey, field] of changedFieldEntries) {
		supabaseData.currentAnalysis = null;
		supabaseData.currentFile = null;

		// wenn draftklasse oder team geändert wurde, müssen die verfügbaren picks neu berechnet werden
		if (fieldKey === "draftClass" || fieldKey === "team") {
			supabaseData.filteredDraftClass = selectedDraftClass;
			supabaseData.filteredTeam = selectedTeam;

			availablePicks.value = supabaseData.rflDrafts
				.filter(
					(entry) =>
						entry.season == selectedDraftClass &&
						entry.franchise_id == selectedTeam,
				)
				.map((entry) => {
					return {
						text: `${entry.round}.${entry.pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
						value: `${entry.round}_${entry.pick}`,
					};
				});

			formFields.pick.options = [
				{
					text: "Bitte einen Pick wählen",
					value: "",
					disabled: true,
				},
				...availablePicks.value,
				{
					text: "Late Round Picks",
					value: "laterounds",
				},
				{
					text: "Trades",
					value: "trades",
				},
				{
					text: "gesamte Draftklasse",
					value: "0",
				},
			];
			formFields.pick.value = "";
		}

		// wenn pick geändert wurde, muss die analyse neu geladen werden
		if (fieldKey === "pick") {
			supabaseData.filteredPick = field.value;

			await supabaseData
				.readAnalysis(
					formData.draftClass.value,
					formData.team.value,
					formData.pick.value,
				)
				.then(() => {
					if (Array.isArray(supabaseData.currentAnalysis)) {
						return supabaseData.currentAnalysis.filter(
							(entry) => entry.user_id === supabaseData.currentUser.id,
						);
					}
					return [];
				});

			await supabaseData.fetchFile();
		}
	}

	previousFieldValues.value = Object.fromEntries(
		Object.entries(formData).map(([fieldKey, field]) => [
			fieldKey,
			field.value,
		]),
	);
};
</script>

<style lang="scss"></style>
