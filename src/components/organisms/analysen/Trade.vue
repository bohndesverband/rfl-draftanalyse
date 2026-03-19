<template>
	<li>
		<ImageUpload
			v-if="data.pick.includes('trade')"
			:image="image"
			:draftPick="data.pick"
		/>

		<EditForm
			v-if="showEditForm"
			:data="data"
			@submit="showEditForm = false"
			@reset="showEditForm = false"
			:key="data.id"
		/>

		<button
			v-else
			class="uk-button uk-button-secondary uk-margin-bottom"
			@click="showEditForm = true"
		>
			<i data-uk-icon="icon: plus"></i>
		</button>

		<slot v-for="trade in data.analysis" :key="trade.id">
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
import { onMounted, ref } from "vue";
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
const showEditForm = ref(false);
const showSpecificEditForm = ref(null);
const image = ref("");

//
// Functions
//
// ========================================================================

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
