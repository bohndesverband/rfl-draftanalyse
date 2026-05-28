<template>
	<Header />

	<div class="uk-container uk-container-small">
		<Alert
			v-if="!supabaseData.filteredDraftClass"
			message="Wähle eine Draftklasse aus"
		/>

		<slot v-else>
			<h2>Draftorder {{ supabaseData.filteredDraftClass }}</h2>

			<table class="uk-table uk-table-striped uk-margin-large-bottom">
				<thead>
					<tr>
						<th colspan="2"></th>
						<th colspan="4" style="text-align: center">Note</th>
					</tr>
					<tr>
						<th>Pick</th>
						<th>Team</th>
						<th>{{ supabaseData.filteredDraftClass }}</th>
						<th>{{ +supabaseData.filteredDraftClass + 1 }}</th>
						<th>{{ +supabaseData.filteredDraftClass + 3 }}</th>
						<th>{{ +supabaseData.filteredDraftClass + 5 }}</th>
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
										year: supabaseData.filteredDraftClass,
										id: pick.franchise_id,
									},
								}"
								@click="setTeamFilter(pick.franchise_id)"
							>
								{{ pick.team_name }}
							</router-link>
						</td>
						<td>{{ findGrade(pick.franchise_id, 0) }}</td>
						<td>{{ findGrade(pick.franchise_id, 1) }}</td>
						<td>{{ findGrade(pick.franchise_id, 3) }}</td>
						<td>{{ findGrade(pick.franchise_id, 5) }}</td>
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

import { ref, onMounted, computed } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const draftOrder = computed(() => {
	if (!supabaseData.filteredDraftClass) return [];

	// Filter draft order by selected class/season (field name: season)
	const filtered = supabaseData.rflDraftOrder.filter(
		(pick) => String(pick.season) === String(supabaseData.filteredDraftClass),
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

	if (supabaseData.filteredDraftClass) {
		await supabaseData.fetchDraftClassAnalysis(
			supabaseData.filteredDraftClass,
			teamId,
		);
	}
};

// finde note für Jahr X
const findGrade = (teamID, year) => {
	console.log("🚀 ~ findGrade ~ year:", year);
	console.log("🚀 ~ findGrade ~ teamID:", teamID);

	const grade = supabaseData.gradeDraftClasses.filter((analysis) => {
		console.log("🚀 ~ findGrade ~ analysis:", analysis);
		return analysis.team_id == teamID && analysis.year == year;
	});

	if (!grade[0]?.grade) return "N/A";

	console.log("🚀 ~ findGrade ~ test:", grade);
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
