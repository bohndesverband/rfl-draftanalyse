<template>
	<li>
		<EditForm
			v-if="showEditForm"
			:data="data"
			@submit="showEditForm = false"
			@reset="showEditForm = false"
		/>

		<div v-else class="uk-grid-collapse" data-uk-grid>
			<div class="uk-width-expand@s">
				<AnalyseContent :title="data.year" :content="data.text" />
			</div>

			<div class="uk-width-auto@s">
				<AnalyseGrade :grade="data.grade" />
			</div>

			<div
				v-if="showEditButton"
				class="uk-grid-width-auto@s uk-flex uk-flex-center uk-flex-middle uk-background-secondary uk-light edit"
				@click="showEditForm = true"
			>
				<i class="uk-padding-small" data-uk-icon="pencil"></i>
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
import { ref, watch } from "vue";
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
const image = ref("");

//
// Functions
//
// ========================================================================

watch(
	() => props.data,
	async () => {
		image.value = await supabaseData.fetchFile(props.data.pick);
	},
	{ immediate: true },
);

// Helper
// ========================================================================
</script>

<style lang="scss" scoped>
div:has(> .grade) {
	display: flex;
}

.edit {
	cursor: pointer;

	&:hover {
		background-color: #1e87f0;
	}
}
</style>
