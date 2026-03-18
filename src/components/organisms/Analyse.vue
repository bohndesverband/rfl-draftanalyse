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
				<ImageUpload
					v-if="data.pick.includes('trade')"
					:image="image"
					:draftPick="data.pick"
				/>
				<h4 class="uk-h5 uk-text-uppercase uk-margin-remove">
					<strong>
						{{ analysisTitle(data.year) }}
					</strong>
				</h4>
				<div
					class="uk-padding-small uk-padding-remove-vertical uk-padding-remove-left"
					v-html="markdown.render(data.text)"
				></div>
			</div>

			<div class="uk-width-auto@s">
				<div
					class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-padding-small grade"
					:data-grade="data.grade"
				>
					<span>Note</span>
					<span>{{ data.grade }}</span>
				</div>
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

import MarkdownIt from "markdown-it";
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
const markdown = new MarkdownIt();
const showEditForm = ref(false);
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

const analysisTitle = (year) => {
	let title = "Nach";

	if (year > 0) {
		title += ` Jahr ${year}`;
	} else {
		title += " dem Draft";
	}

	return title;
};
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
