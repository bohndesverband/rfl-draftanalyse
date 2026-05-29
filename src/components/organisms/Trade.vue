<template>
	<!-- <pre>{{ searchString }}</pre> -->
	<!-- <pre>{{ data }}</pre> -->
	<slot v-if="displayedTrades.length > 0">
		<div class="uk-flex uk-flex-between uk-flex-middle">
			<h4 class="uk-h5 uk-text-uppercase uk-margin-remove uk-text-bold">
				Trades
			</h4>

			<form
				v-if="showSearch"
				class="uk-search uk-search-default"
				@submit.prevent
			>
				<span uk-search-icon></span>
				<input
					v-model="tradeSearch"
					class="uk-search-input"
					type="search"
					placeholder="Trades Filtern"
					aria-label="Search"
				/>
			</form>
		</div>

		<div class="trade-table uk-background-default">
			<div class="trade-table__header">
				<div class="trade-table__row uk-padding-small uk-flex">
					<div>Datum</div>
					<div>Geholt</div>
					<div>Abgegeben</div>
					<div></div>
				</div>
			</div>

			<div class="trade-table__body">
				<div
					v-for="trade in displayedTrades"
					:key="trade.trade_id"
					class="trade-table__row-wrapper"
				>
					<div class="trade-table__row uk-padding-small uk-flex">
						<div>{{ formatDate(trade.date) }}</div>
						<div v-html="trade.gets"></div>
						<div v-html="trade.sends"></div>
						<div v-if="showSearch">
							<button
								class="uk-button uk-button-secondary"
								@click="toggleElement(trade.trade_id, $event)"
							>
								<i data-uk-icon="icon: plus"></i>
							</button>
						</div>
					</div>

					<div
						v-if="showSearch"
						:id="trade.trade_id"
						class="trade-table__form"
						hidden
					>
						<EditForm
							:data="getEditData(trade.trade_id)"
							@reset="showEditForm = false"
							@submit="showEditForm = false"
						/>
					</div>

					<!-- <pre>{{ trade.trade_id }}</pre> -->
					<div v-if="showSearch" class="trade-table__content uk-padding-small">
						<slot v-for="tradeAnalysis in ownAnalysis">
							<Pick
								v-if="tradeMatchesAnalysis(trade.trade_id, tradeAnalysis.pick)"
								:data="tradeAnalysis"
							/>
						</slot>
					</div>
				</div>
			</div>
		</div>
	</slot>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import EditForm from "@/components/organisms/forms/EditForm.vue";
import Analyse from "@/components/organisms/Analyse.vue";
import Pick from "@/components/organisms/analysen/Pick.vue";

import { onMounted, ref, watch, computed } from "vue";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const props = defineProps({
	searchString: {
		type: Array,
	},
	data: {
		type: Object,
	},
	showSearch: {
		type: Boolean,
		default: false,
	},
});

const supabaseData = useSupabaseStore();
const tradeSearch = ref("");
const showEditForm = ref(false);
const tradeAnalyses = ref([]);

const toggleElement = (id, event) => {
	const element = document.getElementById(id);
	const trigger = event?.currentTarget;

	if (element) {
		element.hidden = !element.hidden;
	}

	if (trigger) {
		trigger.hidden = !trigger.hidden;
	}
};

const pickTrades = computed(() => {
	if (props.data) {
		return props.data;
	}

	const trades = [];

	props.searchString.forEach((string) => {
		const trade = supabaseData
			.findTrades(string)
			.map((trade) => {
				return {
					trade_id: trade.trade_id,
					date: trade.date,
					franchise_id: trade.franchise_id,
					assets: trade.trade_side_assets,
				};
			})
			.reduce((acc, trade) => {
				if (!acc[trade.trade_id]) {
					acc[trade.trade_id] = {
						trade_id: trade.trade_id,
						date: trade.date,
						gets: "",
						sends: "",
					};
				}

				if (trade.franchise_id === supabaseData.filteredTeam) {
					acc[trade.trade_id].sends = trade.assets;
				} else {
					acc[trade.trade_id].gets = trade.assets;
				}

				return acc;
			}, {});

		if (Object.keys(trade).length > 0) {
			trades.push(...Object.values(trade));
		}
	});

	return trades.sort((a, b) => {
		return new Date(a.date) - new Date(b.date);
	});
});

const displayedTrades = computed(() => {
	const trades = Array.isArray(pickTrades.value)
		? pickTrades.value
		: Object.values(pickTrades.value);
	const search = tradeSearch.value.trim().toLowerCase();

	if (!search) {
		return trades;
	}

	return trades.filter((trade) => {
		return [trade.gets, trade.sends].some((value) => {
			return String(value ?? "")
				.toLowerCase()
				.includes(search);
		});
	});
});

const filterAnalyses = (analyses) => {
	return analyses
		.filter((analysis) => analysis.pick?.includes("trade"))
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

const tradeMatchesAnalysis = (tradeID, analysesID) => {
	return analysesID.includes(tradeID);
};

const getEditData = (tradeID) => {
	const data = Object.values(ownAnalysis.value)
		.filter((analysis) => analysis.pick.includes(tradeID))
		.map((analysis) => {
			return {
				...analysis,
				trade_id: tradeID,
			};
		})[0];
	console.log("🚀 ~ getEditData ~ data:", data);

	if (data) return data;

	return { trade_id: tradeID };
};

//
// Watchers
//
// ========================================================================

watch(
	() => props.searchString,
	(searchString) => {
		if (!searchString || searchString.length === 0) return;
	},
	{ deep: true },
);

//
// Functions
//
// ========================================================================

const tradeGetAssets = (trade) => {
	return Object.values(trade).filter((tradeSide) => {
		return tradeSide.franchise_id != supabaseData.filteredTeam;
	})[0].asset_names;
};

const formatDate = (dateString) => {
	if (!dateString) {
		return "";
	}

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) {
		return dateString;
	}

	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const tradeLostAssets = (trade) => {
	return Object.values(trade).filter((tradeSide) => {
		return tradeSide.franchise_id == supabaseData.filteredTeam;
	})[0].asset_names;
};
</script>

<style lang="scss" scoped>
.trade-table {
	&__row {
		--_col1: 80px;
		--_col4: 80px;
		--_gap: 2rem;

		gap: var(--_gap);

		> div {
			&:nth-child(1) {
				flex-basis: var(--_col1);
			}

			&:nth-child(2),
			&:nth-child(3) {
				flex-basis: calc(
					(100% - var(--_col1) - var(--_col4) - (var(--_gap) * 3)) / 2
				);
			}

			&:nth-child(4) {
				flex-basis: var(--_col4);
			}
		}
	}

	&__header {
		font-weight: bold;
		text-transform: uppercase;

		.trade-table__row {
			background-color: #f8f8f8;
			border-bottom: 1px solid #e5e5e5;
		}
	}

	&__body {
		white-space: pre-wrap;

		.trade-table__row-wrapper {
			&:nth-child(even) {
				background-color: #f8f8f8;
			}
		}
	}

	&__form {
	}

	&__content {
	}
}
</style>
