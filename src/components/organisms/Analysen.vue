<template>
	<!-- <pre>{{ supabaseData.selectedDraftClass }}</pre> -->
	<div class="draftpick uk-position-relative">
		<h3 class="uk-h4 uk-margin-remove-top">{{ title }}</h3>

		<ul v-if="players" class="uk-list uk-list-divider uk-column-1-2">
			<li v-for="player in players" :key="player.id">
				{{ player.title }}
			</li>
		</ul>

		<!-- filter die eigenen analysen nach den draftpicks -->
		<!-- sortiere analysen nach jahr -->
		<ul class="uk-list uk-list-striped">
			<Analyse
				v-for="analysis in analyses"
				:key="analysis.id"
				:data="analysis"
			/>
		</ul>

		<!-- {{ draftPick }} -->
		<ImageUpload :image="image" :draftPick="draftPick" @uploaded="loadImage" />
		<EditForm
			v-if="showEditForm"
			:data="editData"
			@reset="showEditForm = false"
			@submit="showEditForm = false"
		/>

		<button
			v-else
			class="uk-button uk-button-muted uk-width-1-1 uk-padding-small"
			@click="showEditForm = true"
		>
			<i data-uk-icon="icon: plus; ratio: 2"></i>
		</button>
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
	type: {
		type: String,
	},
	players: {
		type: Array,
	},
});

const supabaseData = useSupabaseStore();
const analyses = ref([]);
const image = ref("");
const showEditForm = ref(false);
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

watch(
	// wenn sich die gewählte draftklasse ändert
	() => supabaseData.selectedDraftClass,
	async () => {
		// wenn filter für draftklasse und team gesetzt ist
		if (
			supabaseData.selectedDraftClass &&
			supabaseData.selectedDraftClass.length > 0
		) {
			let filteredAnalyses;

			if (props.type === "own") {
				// filtere draftklasse nach eigenen einträgen
				filteredAnalyses = supabaseData.selectedDraftClass.filter(
					(entry) => entry.user_id == supabaseData.currentUser.id,
				);
			} else {
				// filtere draftklasse nach einträgen von anderen
				filteredAnalyses = supabaseData.selectedDraftClass.filter(
					(entry) => entry.user_id != supabaseData.currentUser.id,
				);
			}

			analyses.value = filteredAnalyses
				.filter((analysis) => analysis.pick.includes(props.draftPick.pick))
				.sort((a, b) => b.year - a.year);
		} else {
			analyses.value = [];
		}
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
