<template>
	<div class="uk-text-meta uk-text-uppercase">Draftanalyse suchen</div>
	<Form :fields="formFields" @change="updateData" />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Form from "@/components/molecules/Form.vue";
import { reactive, ref, watch, onMounted } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const currentYear = new Date().getFullYear();

const formFields = reactive({
	draftClass: {
		label: "Draftklasse",
		type: "select",
		value: "",
		width: "uk-width-1-2@s",
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
		width: "uk-width-1-2@s",
		options: [
			{
				text: "Bitte ein Team wählen",
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

// watch(
// 	() => supabaseData.filteredDraftClass && supabaseData.filteredTeam,
// 	() => {
// 		if (supabaseData.filteredDraftClass && supabaseData.filteredTeam) {
// 			supabaseData.selectedDraftClass = supabaseData.fetchDraftClassAnalysis(
// 				supabaseData.filteredDraftClass,
// 				supabaseData.filteredTeam,
// 			);
// 		}
// 	},
// );

const updateData = async (formData) => {
	const selectedDraftClass = formData.draftClass.value;
	const selectedTeam = formData.team.value;

	supabaseData.filteredDraftClass = selectedDraftClass;
	supabaseData.filteredTeam = selectedTeam;

	await supabaseData.fetchDraftClassAnalysis(selectedDraftClass, selectedTeam);

	//  availablePicks.value = supabaseData.rflDrafts
	//   .filter(
	//     (entry) =>
	//       entry.season == selectedDraftClass &&
	//       entry.franchise_id == selectedTeam,
	//   )
	//   .map((entry) => {
	//     return {
	//       text: `${entry.round}.${entry.pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
	//       value: `${entry.round}_${entry.pick}`,
	//     };
	//   });
	// formFields.pick.options = [
	//   {
	//     text: "Bitte einen Pick wählen",
	//     value: "",
	//     disabled: true,
	//   },
	//   ...availablePicks.value,
	//   {
	//     text: "Late Round Picks",
	//     value: "laterounds",
	//   },
	//   {
	//     text: "Trades",
	//     value: "trades",
	//   },
	//   {
	//     text: "gesamte Draftklasse",
	//     value: "0",
	//   },
	// ];
	// formFields.pick.value = "";
	// 	}
	// }
	// previousFieldValues.value = Object.fromEntries(
	// 	Object.entries(formData).map(([fieldKey, field]) => [
	// 		fieldKey,
	// 		field.value,
	// 	]),
	// );
};
</script>

<style lang="scss"></style>
