<template>
	<h4 class="uk-h5 uk-text-uppercase uk-margin-remove">
		<strong>
			{{ analysisTitle(title) }}
		</strong>
	</h4>
	<div
		class="uk-padding-small uk-padding-remove-vertical uk-padding-remove-left"
		v-html="markdown.render(content)"
	></div>
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
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
});

const markdown = new MarkdownIt();

//
// Functions
//
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

<style lang="scss"></style>
