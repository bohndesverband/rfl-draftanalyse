<template>
	<div class="uk-container uk-padding">
		<h1 class="uk-heading-primary">Draftanalyse bearbeiten</h1>

		<div data-uk-grid>
			<div class="uk-width-1-3@m">
				<div class="uk-text-meta uk-text-uppercase uk-margin-small-bottom">
					RFL Tools
				</div>

				<div class="uk-button-group">
					<a
						class="uk-button uk-button-secondary"
						href="https://jakesch.shinyapps.io/rfl-tools/#section-draftklassen"
						target="_blank"
						>Draftklassen</a
					>
					<a
						class="uk-button uk-button-secondary"
						href="https://jakesch.shinyapps.io/rfl-tools/#section-draftboards"
						target="_blank"
						>Draftboards</a
					>
				</div>
			</div>

			<div class="uk-width-expand@m">
				<Filter />
			</div>
		</div>

		<hr />

		<div v-if="draftPicks && draftPicks.length > 0">
			<div class="uk-padding-small uk-background-muted">
				<h2>Draftanalyse</h2>

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
					:draftPick="{ pick: 'laterounds' }"
					:players="draftPicks.filter((draftpick) => draftpick.round >= 4)"
				/>
				<Analysen title="Trades" :draftPick="{ pick: 'trade' }" />
				<Analysen title="Draftklasse" :draftPick="{ pick: 'klasse' }" />
			</div>
		</div>

		<div v-else class="uk-alert uk-alert-primary">
			Wähle eine Draftklasse und ein Team aus.
		</div>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Filter from "@/components/organisms/forms/Filter.vue";
import Analysen from "@/components/organisms/Analysen.vue";

import { useSupabaseStore } from "@/store/supabase";
import { ref, watch } from "vue";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const draftPicks = ref([]);

//
// Functions
//
// ========================================================================

watch(
	// wenn sich die gewählte draftklasse ändert
	() => supabaseData.filteredDraftClass && supabaseData.filteredTeam,
	() => {
		// wenn filter für draftklasse und team gesetzt ist
		if (supabaseData.filteredDraftClass && supabaseData.filteredTeam) {
			// lese die picks der gewählten draftklasse und des gewählten teams aus
			draftPicks.value = supabaseData.rflDrafts
				.filter(
					(entry) =>
						entry.season == supabaseData.filteredDraftClass &&
						entry.franchise_id == supabaseData.filteredTeam,
				)
				.map((entry) => {
					return {
						pick: `${entry.round}_${entry.pick}`,
						title: `${entry.round}.${entry.pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
						round: entry.round,
					};
				});
		}
	},
	{ deep: true },
);
</script>

<style lang="scss" scoped>
.uk-button-group {
	gap: 2px;
	flex-wrap: wrap;
}
</style>
