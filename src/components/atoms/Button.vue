<template>
	<input
		class="uk-button"
		:id="button.key"
		:class="button.class"
		:type="button.type || 'submit'"
		:formnovalidate="button.formNoValidate || null"
		:value="button.label"
		:disabled="button.disabled"
	/>
</template>

<script setup>
//
// Imports
//
// ========================================================================

//
// Constants
//
// ========================================================================

const props = defineProps({
	button: {
		type: Object,
		required: true,
	},
});

//
// Functions
//
// ========================================================================
</script>

<style lang="scss"></style>
