<template>
	<div class="uk-card uk-card-default">
		<div class="uk-card-header uk-padding-small">
			<div class="uk-grid-small uk-flex-middle" data-uk-grid>
				<div class="uk-width-expand">
					<h3 class="uk-card-title uk-margin-remove-bottom">
						{{ card.title }}
					</h3>
					<p class="uk-text-meta uk-margin-remove-top">
						<time :datetime="card.meta">{{
							new Date(card.meta).toLocaleDateString()
						}}</time>
					</p>
				</div>
				<div class="uk-width-auto uk-flex uk-flex-right">
					<button class="uk-button uk-button-link" @click="emit('edit')">
						<i class="uk-icon-button" data-uk-icon="pencil"></i>
					</button>
				</div>
			</div>
		</div>
		<div class="uk-card-body uk-padding-small">
			<div
				v-if="supabaseData.filteredPick === 'trades'"
				class="uk-margin-small-bottom"
			>
				<Image :image="{ pick: card.image }" />
			</div>

			<div v-html="markdown.render(card.text)"></div>
		</div>

		<div class="uk-card-footer uk-padding-small">{{ card.footer }}</div>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Image from "@/components/atoms/Image.vue";
import MarkdownIt from "markdown-it";
import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const props = defineProps({
	card: {
		type: Object,
		required: true,
	},
});

const supabaseData = useSupabaseStore();
const markdown = new MarkdownIt();
const emit = defineEmits(["edit"]);
</script>

<style lang="scss">
ul {
	margin-bottom: 0;
}
</style>
