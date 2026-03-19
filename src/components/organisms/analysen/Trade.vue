<template>
	<li>
		<ImageUpload :image="image" :draftPick="data.pick" />

		<button
			class="uk-button uk-button-secondary uk-margin-bottom"
			@click="showImageUpload = true"
		>
			<i data-uk-icon="icon: plus"></i>
		</button>

		<div data-uk-grid>
			<div class="uk-width-expand@m">
				<slot v-for="trade in ownAnalyses" :key="trade.id">
					<EditForm
						v-if="showSpecificEditForm === trade.id"
						:data="trade"
						@submit="showSpecificEditForm = false"
						@reset="showSpecificEditForm = false"
						:key="trade.id"
					/>

					<div v-else class="uk-grid-collapse" data-uk-grid>
						<div class="uk-width-expand@s">
							<AnalyseContent :title="trade.year" :content="trade.text" />
						</div>

						<div class="uk-width-auto@s">
							<AnalyseGrade :grade="trade.grade" />
						</div>

						<div
							v-if="showEditButton"
							class="uk-grid-width-auto@s uk-flex uk-flex-center uk-flex-middle uk-background-secondary uk-light edit"
							@click="showSpecificEditForm = trade.id"
						>
							<i class="uk-padding-small" data-uk-icon="pencil"></i>
						</div>
					</div>
				</slot>
			</div>

			<div class="uk-width-1-3@m">
				<ul
					v-if="otherAnalyses.length > 0"
					class="uk-accordion-default"
					data-uk-accordion
				>
					<li>
						<a class="uk-accordion-title" href
							>+ Zeige Einschätzung von anderen</a
						>
						<div class="uk-accordion-content">
							<ul class="uk-list uk-list-striped">
								<li v-for="trade in otherAnalyses" :key="trade.id">
									<div class="uk-grid-collapse" data-uk-grid>
										<div class="uk-width-expand@s">
											<AnalyseContent
												:title="trade.year"
												:content="trade.text"
											/>
										</div>

										<div class="uk-width-auto@s">
											<AnalyseGrade :grade="trade.grade" />
										</div>
									</div>
								</li>
							</ul>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</li>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import AnalyseContent from "@/components/molecules/analysen/AnalyseContent.vue";
import AnalyseGrade from "@/components/atoms/analysen/AnalyseGrade.vue";
import EditForm from "@/components/organisms/forms/EditForm.vue";
import ImageUpload from "@/components/molecules/ImageUpload.vue";

import { onMounted, ref, watch } from "vue";
import { useSupabaseStore } from "@/store/supabase";
//
// Constants
//
// ========================================================================

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
	showEditButton: {
		type: Boolean,
		default: true,
	},
});

const supabaseData = useSupabaseStore();
const ownAnalyses = ref([]);
const otherAnalyses = ref([]);
const showSpecificEditForm = ref(null);
const image = ref("");

//
// Functions
//
// ========================================================================

watch(
	() => props.data,
	() => {
		ownAnalyses.value = props.data.analysis.filter(
			(analysis) => analysis.user_id === supabaseData.currentUser.id,
		);

		otherAnalyses.value = props.data.analysis.filter(
			(analysis) => analysis.user_id !== supabaseData.currentUser.id,
		);
	},
	{ immediate: true },
);

onMounted(async () => {
	image.value = await supabaseData.fetchFile(props.data.pick);
});

// Helper
// ========================================================================
</script>

<style lang="scss" scoped>
div:has(> .grade) {
	display: flex;
}

.grade {
	overflow: hidden;
	position: relative;
	font-weight: bold;
	color: white;

	span {
		z-index: 1;
	}

	&::after {
		content: "";
		position: absolute;
		width: 600px;
		top: 0;
		left: 0;
		translate: calc(attr(data-grade %) * -85 / 6);
		bottom: 0;
		background: linear-gradient(
			90deg,
			rgba(42, 123, 155, 1) 25%,
			rgba(124, 204, 121, 1) 30%,
			rgba(210, 210, 108, 1) 40%,
			rgba(218, 152, 90, 1) 60%,
			rgba(237, 83, 83, 1) 100%
		);
		z-index: 0;
	}
}

.edit {
	cursor: pointer;

	&:hover {
		background-color: #1e87f0;
	}
}
</style>
