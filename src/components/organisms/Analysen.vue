<template>
	<!-- <pre>{{ draftPick }}</pre> -->
	<!-- <pre>{{ ownAnalyses }}</pre> -->
	<!-- <pre>{{ players }}</pre> -->
	<!-- <pre>{{ supabaseData.teamTrades }}</pre> -->
	<!-- <pre>{{ tradeData }}</pre> -->
	<div
		class="draftpick uk-position-relative uk-background-muted uk-padding-small"
	>
		<div data-uk-grid>
			<div class="uk-width-expand@m uk-position-relative">
				<div class="uk-position-top-right uk-button-group">
					<!-- <button
						v-if="!image && draftPick.pick !== 'trade'"
						class="uk-button uk-button-primary"
						@click="showUploadForm = !showUploadForm"
					>
						<i data-uk-icon="icon: image"></i>
					</button> -->
				</div>

				<h3 class="uk-h4 uk-margin-remove-top">{{ title }}</h3>

				<ul v-if="players" class="uk-list uk-list-divider uk-column-1-2">
					<li v-for="player in players" :key="player.id">
						{{ player.title }}
					</li>
				</ul>

				<!-- <pre>{{ pickTrades }}</pre> -->
				<Trade :searchString="createTradeSeachString()" />

				<!-- <ImageUpload
					v-if="showUploadForm || image"
					:image="image"
					:draftPick="draftPick"
					@uploaded="loadImage"
				/> -->

				<button
					v-if="!showEditForm"
					class="uk-button uk-button-secondary uk-margin-top"
					@click="showEditForm = true"
				>
					<i data-uk-icon="icon: plus"></i>
				</button>

				<EditForm
					v-if="showEditForm"
					:data="editData"
					@reset="showEditForm = false"
					@submit="showEditForm = false"
				/>

				<!-- filter die eigenen analysen nach den draftpicks -->
				<!-- sortiere analysen nach jahr -->
				<ul
					class="uk-list"
					:class="draftPick.pick != 'trade' ? 'uk-list-striped' : ''"
				>
					<slot v-if="draftPick.roundPick === 'trade'">
						<Trade :data="tradeData" :showSearch="true" />
					</slot>

					<slot v-else>
						<Analyse
							v-for="analysis in ownAnalysis"
							:key="analysis.id"
							:data="analysis"
						/>
					</slot>
				</ul>
			</div>

			<div v-if="draftPick.roundPick != 'trade'" class="uk-width-1-3@m">
				<AnalyseVonAnderen :data="otherAnalysis" />
			</div>
		</div>
	</div>

	<!-- <pre>{{ supabaseData.selectedDraftClass }}</pre> -->
</template>

<script setup>
//
// Imports
//
// ========================================================================

import ImageUpload from "@/components/molecules/ImageUpload.vue";
import Analyse from "@/components/organisms/Analyse.vue";
import EditForm from "@/components/organisms/forms/EditForm.vue";
import AnalyseVonAnderen from "@/components/molecules/analysen/AnalyseVonAnderen.vue";
import Trade from "@/components/organisms/Trade.vue";

import { useSupabaseStore } from "@/store/supabase";
import { onMounted, ref, watch, computed } from "vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	title: {
		type: String,
		required: true,
	},
	draftPick: {
		type: Object,
		required: true,
	},
	players: {
		type: Array,
	},
});

const supabaseData = useSupabaseStore();
const analyses = ref([]);
const pickTrades = ref([]);

const image = ref("");
const showEditForm = ref(false);
const showUploadForm = ref(false);
const editData = ref();
const currentPick = computed(() => {
	return props.draftPick.roundPick || props.draftPick.pick;
});

//
// Functions
//
// ========================================================================

const createTradeSeachString = () => {
	if (props.players) {
		return props.players.map((pick) => {
			return `${supabaseData.selectedDraftYear} ${pick.round}.${pick.pick}`;
		});
	}

	if (props.draftPick) {
		return [
			`${supabaseData.selectedDraftYear} ${props.draftPick.round}.${props.draftPick.pick}`,
		];
	}

	return [];
};

const tradeData = computed(() => {
	const madePicks = supabaseData.selectedDraftClass.map((pick) => {
		const newPick = String(pick.pick).padStart(2, "0");

		return `${pick.season} ${pick.round}.${newPick}`;
	});
	// console.log("🚀 ~ madePicks:", madePicks);

	// remove all trades with made and old picks
	const year = supabaseData.selectedDraftYear;

	const filteredTrades = Object.values(supabaseData.teamTrades).filter(
		(trade) => {
			const assets = trade.asset_names;

			if (!assets || typeof assets !== "string") return false;

			// 1. muss Jahr enthalten
			const hasYear = assets.includes(year);

			// 2. darf KEIN madePick enthalten
			const hasMadePick = madePicks.some((pick) => assets.includes(pick));

			return hasYear && !hasMadePick;
			// return hasYear;
		},
	);

	return filteredTrades
		.map((trade) => ({
			trade_id: trade.trade_id,
			date: trade.date,
			franchise_id: trade.franchise_id,
			assets: trade.trade_side_assets,
			// pick: "trade",
		}))
		.reduce((acc, trade) => {
			if (!acc[trade.trade_id]) {
				acc[trade.trade_id] = {
					trade_id: trade.trade_id,
					date: trade.date,
					gets: "",
					sends: "",
					pick: "trade",
				};
			}

			if (trade.franchise_id === supabaseData.filteredTeam) {
				acc[trade.trade_id].sends = trade.assets;
			} else {
				acc[trade.trade_id].gets = trade.assets;
			}

			return acc;
		}, {});

	const normalizeAssets = (text = "") =>
		text
			.split("\n")
			.map((a) => a.trim())
			.filter(Boolean);

	const groupedTrades = Object.values(trades).reduce((acc, trade) => {
		// alle assets des trades sammeln
		const assets = [
			...normalizeAssets(trade.gets),
			...normalizeAssets(trade.sends),
		];

		assets.forEach((asset) => {
			if (!acc[asset]) {
				acc[asset] = [];
			}

			acc[asset].push(trade);
		});

		return acc;
	}, {});
});

// const loadImage = async (pick) => {
// 	// console.log("🚀 ~ loadImage ~ pick:", pick);
// 	if (!props.draftPick?.pick.includes("trade")) {
// 		image.value = await supabaseData.fetchFile(pick);
// 	}
// };

const filterAnalyses = (analyses) => {
	// console.log("🚀 ~ filterAnalyses ~ analyses:", analyses);
	if (!currentPick.value) return [];

	return analyses
		.filter((analysis) => analysis.pick?.includes(currentPick.value))
		.sort((a, b) => b.year - a.year);
};

const ownAnalysis = computed(() => {
	if (!supabaseData.selectedDraftYear || !supabaseData.currentUser) return [];

	return filterAnalyses(
		supabaseData.selectedDraftAnalysis.filter(
			(entry) => entry.user_id == supabaseData.currentUser.id,
		),
	);
});

const otherAnalysis = computed(() => {
	if (!supabaseData.selectedDraftYear || !supabaseData.currentUser) return [];

	return filterAnalyses(
		supabaseData.selectedDraftAnalysis.filter(
			(entry) => entry.user_id != supabaseData.currentUser.id,
		),
	);
});

// watch(
// 	// wenn sich die gewählte draftklasse ändert
// 	() => [
// 		supabaseData.selectedDraftAnalysis,
// 		supabaseData.currentUser?.id,
// 		currentPick.value,
// 	],
// 	async () => {
// 		if (
// 			!supabaseData.selectedDraftYear ||
// 			supabaseData.selectedDraftYear.length == 0 ||
// 			!supabaseData.currentUser
// 		) {
// 			supabaseData.ownAnalysis = [];
// 			supabaseData.otherAnalysis = [];
// 			analyses.value = [];
// 			return;
// 		}

// 		// filtere draftklasse nach eigenen einträgen
// 		let tmpAnalyses = supabaseData.selectedDraftAnalysis.filter(
// 			(entry) => entry.user_id == supabaseData.currentUser.id,
// 		);
// 		console.log("🚀 ~ tmpAnalyses:", tmpAnalyses);

// 		supabaseData.ownAnalysis = filterAnalyses(tmpAnalyses);

// 		// filtere draftklasse nach einträgen von anderen
// 		tmpAnalyses = supabaseData.selectedDraftAnalysis.filter(
// 			(entry) => entry.user_id != supabaseData.currentUser.id,
// 		);

// 		supabaseData.otherAnalysis = filterAnalyses(tmpAnalyses);
// 	},
// 	{ deep: true, immediate: true },
// );

watch(
	() => supabaseData.filteredAnalyses && supabaseData.filteredTeam,
	() => {
		if (analyses.value.length > 0) {
			editData.value = analyses.value.find(
				(analysis) => analysis.pick === props.draftPick.id,
			)?.pick;
		} else {
			editData.value = props.draftPick;
		}

		// loadImage(props.draftPick.pick);
	},
	{ deep: true, immediate: true },
);

watch(
	() => supabaseData.selectedDraftYear && supabaseData.filteredTeam,
	() => {
		// loadImage(props.draftPick.pick);
	},
	{ deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
h3 {
	font-weight: bold;
}

.uk-list-striped > :nth-of-type(odd) {
	background: white;
}

.draftpick {
	+ .draftpick {
		margin-top: 1rem;
	}
}
</style>
