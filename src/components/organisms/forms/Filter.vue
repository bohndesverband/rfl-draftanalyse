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
import { useRouter } from "vue-router";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const currentYear = new Date().getFullYear();
const router = useRouter();

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
			...Array.from({ length: currentYear - 2023 }, (_, i) => {
				return { value: `${2024 + i}`, text: 2024 + i };
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

// Watch form field values and run filter on every update
watch(
	() => [formFields.team.value],
	async () => {
		if (formFields.team.value) {
			await supabaseData.fetchteamTradesById(formFields.team.value);
		}
	},
);

watch(
	() => supabaseData.filteredTeam,
	(teamId) => {
		if (teamId && formFields.team.value !== teamId) {
			formFields.team.value = teamId;
		} else if (!teamId) {
			formFields.team.value = "";
		}
	},
	{ immediate: true },
);

watch(
	() => supabaseData.selectedDraftYear,
	(draftClass) => {
		if (draftClass && formFields.draftClass.value !== draftClass) {
			formFields.draftClass.value = draftClass;
		}
	},
	{ immediate: true },
);

// watch(
// 	() => supabaseData.selectedDraftYear && supabaseData.filteredTeam,
// 	() => {
// 		if (supabaseData.selectedDraftYear && supabaseData.filteredTeam) {
// 			supabaseData.selectedDraftYear = supabaseData.fetchDraftClassAnalysis(
// 				supabaseData.selectedDraftYear,
// 				supabaseData.filteredTeam,
// 			);
// 		}
// 	},
// );

const updateData = async (formData) => {
	const selectedDraftYear = formData.draftClass.value;
	const selectedTeam = formData.team.value;

	supabaseData.selectedDraftYear = selectedDraftYear;
	supabaseData.filteredTeam = selectedTeam;

	await supabaseData.fetchDraftClassAnalysis(selectedDraftYear, selectedTeam);
	await supabaseData.fetchRflDraftOrdersByYear(selectedDraftYear);

	// wenn Draftklasse ausgewählt, lese alle Grades für die gesamte Klasse im ausgewählten Jahr ein
	if (selectedDraftYear) {
		await supabaseData.fetchDraftClassNotesByYear(selectedDraftYear);
	}

	if (selectedDraftYear && selectedTeam) {
		router.push({
			name: "edit",
			params: { year: selectedDraftYear, id: selectedTeam },
		});
	}

	//  availablePicks.value = supabaseData.rflDrafts
	//   .filter(
	//     (entry) =>
	//       entry.season == selectedDraftYear &&
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
