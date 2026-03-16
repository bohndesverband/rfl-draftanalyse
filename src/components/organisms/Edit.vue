<template>
	<div class="uk-container uk-padding">
		<h1 class="uk-heading-primary">Draftanalyse bearbeiten</h1>

		<Filter />
		<hr />

		<!-- <pre>{{ otherAnalysis }}</pre> -->

		<div
			class="uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-expand@m"
			data-uk-grid
		>
			<div v-if="supabaseData.showEditCard" class="uk-width-1-1 uk-width-1-2@m">
				<div class="uk-card uk-card-default uk-card-body">
					<EditForm :data="supabaseData.currentAnalysis" />
				</div>
			</div>

			<slot v-for="analysis in ownAnalysis" :key="analysis.id">
				<div
					v-if="analysis.id !== supabaseData.currentAnalysis?.id"
					:class="supabaseData.showEditCard ? 'uk-width-1-2@m' : ''"
				>
					<Card
						:card="{
							title: analysisTitle(analysis.year),
							meta: analysis.last_update,
							text: analysis.text,
							footer: `Note: ${analysis.grade}`,
						}"
						@edit="startEdit(analysis)"
					/>
				</div>
			</slot>
			<div v-if="showAddColumn()" class="uk-width-1-3@m column-add">
				<div
					class="uk-card uk-card-muted uk-flex uk-flex-middle uk-flex-center"
					@click="supabaseData.showEditCard = true"
				>
					<i data-uk-icon="icon: plus; ratio: 3"></i>
				</div>
			</div>
		</div>

		<div class="uk-background-muted uk-padding uk-margin-large-top">
			<h2>Einschätzungen von Anderen</h2>

			<Card
				v-for="analysis in otherAnalysis"
				:card="{
					title: `Jahr ${analysis.year}`,
					meta: analysis.last_update,
					text: analysis.text,
					footer: `Note: ${analysis.grade}`,
				}"
			/>

			<!-- <div v-html="markdown.render(otherAnalysis.text)"></div>
			<span class="uk-text-large">Note: {{ otherAnalysis.grade }}</span> -->
		</div>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Filter from "@/components/organisms/forms/Filter.vue";
import Card from "@/components/organisms/Card.vue";
import EditForm from "@/components/organisms/forms/EditForm.vue";
import { useSupabaseStore } from "@/store/supabase";
import { ref, watch } from "vue";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const ownAnalysis = ref([]);
const otherAnalysis = ref([]);

//
// Functions
//
// ========================================================================

watch(
	() => supabaseData.currentPlayerAnalysis,
	() => {
		ownAnalysis.value = supabaseData.currentPlayerAnalysis.filter(
			(entry) => entry.user_id == supabaseData.currentUser.id,
		);

		otherAnalysis.value = supabaseData.currentPlayerAnalysis.filter(
			(entry) => entry.user_id != supabaseData.currentUser.id,
		);
	},
	{ deep: true },
);

// Start Editing existing analysis
// ========================================================================

const startEdit = (analysis) => {
	supabaseData.currentAnalysis = analysis;

	supabaseData.showEditCard = true;
};

// Helper
// ========================================================================

const analysisTitle = (year) => {
	let title = "Nach";

	if (year > 0) {
		title += ` Jahr ${year}`;
	} else {
		title += " dem Draft";
	}

	return title;
};

const showAddColumn = () => {
	if (
		supabaseData.filteredDraftClass &&
		supabaseData.filteredTeam &&
		supabaseData.filteredPick &&
		!supabaseData.showEditCard
	) {
		return true;
	}

	return false;
};
</script>

<style lang="scss" scoped>
.column-add {
	display: flex;

	@media screen and (max-width: 960px) {
		order: -1;
	}

	.uk-card {
		flex-grow: 1;
	}
}

.uk-card-muted {
	background-color: #f8f8f8;
	transition: background-color 0.3s;
	cursor: pointer;
	min-height: 300px;

	&:hover {
		background-color: #e8e8e8;
	}
}
</style>
