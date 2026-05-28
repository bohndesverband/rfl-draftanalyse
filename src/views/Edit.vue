<template>
	<Header />

	<div class="uk-container">
		<router-link
			:to="{
				name: 'overview',
			}"
			>← Überblick</router-link
		>

		<slot v-if="draftPicks && draftPicks.length > 0">
			<div class="uk-margin-top uk-padding-small uk-background-muted">
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
		</slot>

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

onMounted(() => {
	// wenn keine params in der url, dann zurück zur overview
	if (!route.params.year || !route.params.id) {
		router.push("/overview");
	}

	// wenn params in der url, dann setze supabase store
	supabaseData.filteredDraftClass = route.params.year;
	supabaseData.filteredTeam = route.params.id;

	// lese die picks der gewählten draftklasse und des gewählten teams aus
	setDraftPicks();
});

//
// Functions
//
// ========================================================================

watch(
	() => [supabaseData.filteredTeam, supabaseData.filteredDraftClass],
	() => {
		setDraftPicks();
	},
);

const setDraftPicks = () => {
	draftPicks.value = supabaseData.rflDrafts
		.filter(
			(entry) =>
				entry.season == supabaseData.filteredDraftClass &&
				entry.franchise_id == supabaseData.filteredTeam,
		)
		.map((entry) => {
			return {
				roundPick: `${entry.round}_${entry.pick}`,
				title: `${entry.round}.${entry.pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
				round: entry.round,
				pick: String(entry.pick).padStart(2, "0"),
			};
		});
};
</script>

<style lang="scss" scoped>
.uk-button-group {
	gap: 2px;
	flex-wrap: wrap;
}
</style>
