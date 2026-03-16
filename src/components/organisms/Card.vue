<template>
	<div class="uk-card uk-card-default">
		<div class="uk-card-header">
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
		<div class="uk-card-body" v-html="markdown.render(card.text)"></div>

		<div class="uk-card-footer">{{ card.footer }}</div>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import MarkdownIt from "markdown-it";

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

const markdown = new MarkdownIt();
const emit = defineEmits(["edit"]);

//
// Functions
//
// ========================================================================
const startEdit = () => {};
</script>

<style lang="scss"></style>
