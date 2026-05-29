<template>
	<Header />

	<div class="uk-container uk-container-small">
		<Alert
			v-if="!supabaseData.selectedDraftYear.length > 0"
			message="Wähle eine Draftklasse aus"
		/>

		<slot v-else>
			<h2>Draftorder {{ supabaseData.selectedDraftYear }}</h2>

			<table
				class="uk-table uk-table-striped uk-table-middle uk-margin-large-bottom"
			>
				<thead>
					<tr>
						<th colspan="2"></th>
						<th colspan="4" style="text-align: center">Note</th>
					</tr>
					<tr>
						<th>Pick</th>
						<th>Team</th>
						<th>{{ supabaseData.selectedDraftYear }}</th>
						<th>{{ +supabaseData.selectedDraftYear + 1 }}</th>
						<th>{{ +supabaseData.selectedDraftYear + 3 }}</th>
						<th>{{ +supabaseData.selectedDraftYear + 5 }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="pick in draftOrder" :key="pick.pick">
						<td>{{ pick.pick }}</td>
						<td>
							<router-link
								:to="{
									name: 'edit',
									params: {
										year: supabaseData.selectedDraftYear,
										id: pick.franchise_id,
									},
								}"
								@click="setTeamFilter(pick.franchise_id)"
							>
								{{ pick.team_name }}
							</router-link>
						</td>
						<td v-for="number in [0, 1, 3, 5]">
							<AnalyseGrade
								:grade="findGrade(pick.franchise_id, number)"
								:showTitle="false"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</slot>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Header from "@/components/organisms/Header.vue";
import Alert from "@/components/atoms/Alert.vue";
import AnalyseGrade from "@/components/atoms/analysen/AnalyseGrade.vue";

import { ref, onMounted, computed } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const draftOrder = computed(() => {
	if (!supabaseData.selectedDraftYear) return [];

	// Filter draft order by selected class/season (field name: season)
	const filtered = supabaseData.rflDraftOrder.filter(
		(pick) => String(pick.season) === String(supabaseData.selectedDraftYear),
	);

	// Merge with teams to attach `team_name` to each pick
	const merged = filtered.map((pick) => {
		const team = supabaseData.rflTeams.find(
			(t) => t.team_id === pick.franchise_id,
		);
		return {
			...pick,
			team_name: team ? team.team_name : "Unknown Team",
		};
	});

	// Ensure picks are sorted by pick number
	return merged.sort((a, b) => (Number(a.pick) || 0) - (Number(b.pick) || 0));
});

//
// onMounted
//
// ========================================================================

onMounted(() => {
	supabaseData.filteredTeam = null;
});

//
// Functions
//
// ========================================================================

const setTeamFilter = async (teamId) => {
	supabaseData.filteredTeam = teamId;

	if (supabaseData.selectedDraftYear) {
		await supabaseData.fetchDraftClassAnalysis(
			supabaseData.selectedDraftYear,
			teamId,
		);
	}
};

// finde note für Jahr X
const findGrade = (teamID, year) => {
	const grade = supabaseData.gradeDraftClasses.filter((analysis) => {
		return analysis.team_id == teamID && analysis.year == year;
	});

	if (!grade[0]?.grade) return "N/A";

	return grade[0].grade;
};
</script>

<style lang="scss" scoped>
tr {
	> :nth-child(1) {
		text-align: right;
	}

	> :nth-child(n + 3) {
		text-align: center;
	}
}
</style>
