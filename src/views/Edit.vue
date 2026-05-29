<template>
	<Header />

	<!-- <pre>{{ supabaseData.gradeDraftClasses }}</pre> -->
	<div class="uk-container uk-container-large">
		<router-link
			:to="{
				name: 'overview',
			}"
			>← Überblick</router-link
		>

		<slot v-if="draftPicks && draftPicks.length > 0">
			<div class="uk-margin-top uk-padding-small">
				<h2>
					Draftanalyse {{ findTeamNameByID(supabaseData.filteredTeam) }}
					{{ supabaseData.selectedDraftYear }}
				</h2>

				<!-- nur picks der ersten drei runden -->
				<Analysen
					v-for="draftPick in draftPicks.filter(
						(draftpick) => draftpick.round <= 3,
					)"
					:key="draftPick.id"
					:title="draftPick.title"
					:draftPick="draftPick"
				/>

				<Analysen
					title="Late Round Picks"
					:draftPick="{ roundPick: 'laterounds' }"
					:players="draftPicks.filter((draftpick) => draftpick.round >= 4)"
				/>
				<Analysen title="Trades" :draftPick="{ roundPick: 'trade' }" />
				<Analysen title="Draftklasse" :draftPick="{ pick: 'klasse' }" />
			</div>
		</slot>

		<div v-else class="uk-alert uk-alert-primary">
			Wähle eine Draftklasse und ein Team aus.
		</div>
	</div>

	<a href="" data-uk-totop data-uk-scroll>Nach oben</a>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Header from "@/components/organisms/Header.vue";
import Analysen from "@/components/organisms/Analysen.vue";

import { useSupabaseStore } from "@/store/supabase";
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const route = useRoute();
const router = useRouter();
const draftPicks = ref([]);

//
// onMounted
//
// ========================================================================

onMounted(async () => {
	// wenn keine params in der url, dann zurück zur overview
	if (!route.params.year || !route.params.id) {
		router.push("/overview");
		return;
	}

	// wenn params in der url, dann setze supabase store
	supabaseData.selectedDraftYear = route.params.year;
	supabaseData.filteredTeam = route.params.id;

	// lese die picks der gewählten draftklasse und des gewählten teams aus
	await loadRouteData(route.params.year, route.params.id);

	// lese alle draftpicks des entsprechenden teams und jahres
});

//
// Functions
//
// ========================================================================

const loadRouteData = async (year, teamId) => {
	// nötig um daten zu laden, wenn ie edit route direkt aufgerufen wird
	await Promise.all([
		supabaseData.currentUser ? Promise.resolve() : supabaseData.getSession(),
		supabaseData.rflTeams.length
			? Promise.resolve()
			: supabaseData.fetchRflTeams(),
		supabaseData.rflDrafts.length
			? Promise.resolve()
			: supabaseData.fetchRflDrafts(),
		supabaseData.fetchDraftClassAnalysis(year, teamId),
		supabaseData.fetchteamTradesById(teamId),
		supabaseData.fetchRflDraftOrdersByYear(year),
		supabaseData.fetchDraftClassNotesByYear(year),
	]);

	loadDraftPicks();
	supabaseData.findDraftClass(teamId, year);
};

watch(
	() => [supabaseData.filteredTeam, supabaseData.selectedDraftYear],
	() => {
		loadDraftPicks();
		supabaseData.findDraftClass(route.params.id, route.params.year);
	},
);

const loadDraftPicks = () => {
	draftPicks.value = supabaseData.rflDrafts
		.filter(
			(entry) =>
				entry.season == supabaseData.selectedDraftYear &&
				entry.franchise_id == supabaseData.filteredTeam,
		)
		.map((entry) => {
			const pick = String(entry.pick).padStart(2, "0");

			return {
				roundPick: `${entry.round}_${pick}`,
				title: `${entry.round}.${pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
				round: entry.round,
				pick: pick,
			};
		});
};

const findTeamNameByID = (teamID) => {
	return (
		supabaseData.rflTeams.find((team) => team.team_id === teamID)?.team_name ||
		""
	);
};
</script>

<style lang="scss" scoped>
.uk-button-group {
	gap: 2px;
	flex-wrap: wrap;
}
</style>
