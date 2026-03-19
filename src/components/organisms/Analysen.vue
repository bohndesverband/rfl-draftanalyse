<template>
	<!-- <pre>{{ draftPick }}</pre> -->
	<!-- <pre>{{ tradeAnalyses }}</pre> -->
	<div class="draftpick uk-position-relative">
		<div data-uk-grid>
			<div class="uk-width-expand@m uk-position-relative">
				<div class="uk-position-top-right uk-button-group">
					<button
						v-if="!showEditForm"
						class="uk-button uk-button-secondary"
						@click="showEditForm = true"
					>
						<i data-uk-icon="icon: plus"></i>
					</button>
					<button
						v-if="!image && draftPick.pick !== 'trade'"
						class="uk-button uk-button-primary"
						@click="showUploadForm = !showUploadForm"
					>
						<i data-uk-icon="icon: image"></i>
					</button>
				</div>

				<h3 class="uk-h4 uk-margin-remove-top">{{ title }}</h3>

				<ul v-if="players" class="uk-list uk-list-divider uk-column-1-2">
					<li v-for="player in players" :key="player.id">
						{{ player.title }}
					</li>
				</ul>

				<ImageUpload
					v-if="showUploadForm || image"
					:image="image"
					:draftPick="draftPick"
					@uploaded="loadImage"
				/>

				<EditForm
					v-if="showEditForm"
					:data="editData"
					@reset="showEditForm = false"
					@submit="showEditForm = false"
				/>

				<!-- filter die eigenen analysen nach den draftpicks -->
				<!-- sortiere analysen nach jahr -->
				<ul class="uk-list uk-list-striped">
					<slot v-if="draftPick.pick === 'trade'">
						<Analyse
							v-for="trade in tradeAnalyses.sort(
								(a, b) => b.analysis[0].id - a.analysis[0].id,
							)"
							:key="trade.id"
							:data="trade"
						/>
					</slot>

					<slot v-else>
						<Analyse
							v-for="analysis in ownAnalyses"
							:key="analysis.id"
							:data="analysis"
						/>
					</slot>
				</ul>
			</div>

			<div v-if="draftPick.pick != 'trade'" class="uk-width-1-3@m">
				<AnalyseVonAnderen :data="otherAnalyses" />
			</div>
		</div>
	</div>
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

import { useSupabaseStore } from "@/store/supabase";
import { ref, watch } from "vue";

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

const ownAnalyses = ref([]);
const otherAnalyses = ref([]);
const tradeAnalyses = ref([]);

const image = ref("");
const showEditForm = ref(false);
const showUploadForm = ref(false);
const editData = ref();

//
// Functions
//
// ========================================================================

const loadImage = async (pick) => {
	// console.log("🚀 ~ loadImage ~ pick:", pick);
	if (!props.draftPick.pick.includes("trade")) {
		image.value = await supabaseData.fetchFile(pick);
	}
};

const filterAnalyses = (analyses) => {
	return analyses
		.filter((analysis) => analysis.pick.includes(props.draftPick.pick))
		.sort((a, b) => b.year - a.year);
};

const groupAnalysesByPick = () => {
	const map = new Map();

	[...ownAnalyses.value, ...otherAnalyses.value]
		.filter((analysis) => analysis.pick.includes("trade"))
		.forEach((a) => {
			if (!map.has(a.pick)) {
				map.set(a.pick, {
					team_id: a.team_id,
					draft_class: a.draft_class,
					pick: a.pick,
					analysis: [],
				});
			}

			map.get(a.pick).analysis.push({
				id: a.id,
				created_at: a.created_at,
				year: a.year,
				text: a.text,
				grade: a.grade,
				user_id: a.user_id,
				last_update: a.last_update,
				pick: a.pick,
			});
		});

	tradeAnalyses.value = Array.from(map.values());
};

watch(
	// wenn sich die gewählte draftklasse ändert
	() => supabaseData.selectedDraftClass,
	async () => {
		// wenn filter für draftklasse und team gesetzt ist

		if (
			!supabaseData.selectedDraftClass ||
			supabaseData.selectedDraftClass.length == 0
		) {
			ownAnalyses.value = [];
			otherAnalyses.value = [];
			analyses.value = [];
			tradeAnalyses.value = [];
			image.value = "";
			return;
		}

		// filtere draftklasse nach eigenen einträgen
		let tmpAnalyses = supabaseData.selectedDraftClass.filter(
			(entry) => entry.user_id == supabaseData.currentUser.id,
		);

		ownAnalyses.value = filterAnalyses(tmpAnalyses);

		// filtere draftklasse nach einträgen von anderen
		tmpAnalyses = supabaseData.selectedDraftClass.filter(
			(entry) => entry.user_id != supabaseData.currentUser.id,
		);

		otherAnalyses.value = filterAnalyses(tmpAnalyses);

		groupAnalysesByPick();
	},
	{ deep: true, immediate: true },
);

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

		loadImage(props.draftPick.pick);
	},
	{ deep: true, immediate: true },
);

watch(
	() => supabaseData.filteredDraftClass && supabaseData.filteredTeam,
	() => {
		loadImage(props.draftPick.pick);
	},
	{ deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
.uk-list-striped > :nth-of-type(odd) {
	background: white;
}

.draftpick {
	border: 2px dashed #e5e5e5;
	padding: 1rem;

	+ .draftpick {
		margin-top: 1rem;
	}
}
</style>
