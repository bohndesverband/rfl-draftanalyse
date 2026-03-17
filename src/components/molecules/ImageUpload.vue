<template>
	<UploadForm
		v-if="showUploadForm || !image"
		:id="props.draftPick?.pick || props.draftPick"
		@uploaded="uploaded"
	/>

	<div v-if="image" class="uk-position-relative">
		<button
			class="uk-position-top-right uk-position-small uk-button uk-button-secondary uk-button-small uk-light uk-flex uk-flex-center uk-flex-middle uk-padding-small"
			@click="showUploadForm = true"
		>
			<i data-uk-icon="icon: pencil"></i>
		</button>

		<img :src="image" class="uk-width-1-1 uk-margin-bottom" />
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import UploadForm from "@/components/organisms/forms/UploadForm.vue";
import { ref } from "vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	image: {
		type: String,
	},
	draftPick: {
		type: [String, Object],
		required: true,
	},
});

const showUploadForm = ref(false);
const emit = defineEmits(["uploaded"]);

//
// Functions
//
// ========================================================================

const uploaded = (pick) => {
	console.log("🚀 ~ uploaded ~ pick:", pick);
	showUploadForm.value = false;
	emit("uploaded", pick);
};
</script>

<style lang="scss" scoped>
button {
	&:hover {
		background-color: #1e87f0;
	}
}
</style>
