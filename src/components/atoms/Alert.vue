<template>
	<div class="uk-alert" :class="getClass(type)" v-html="message"></div>
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
	type: {
		type: String,
		default: "",
	},
	message: {
		type: String,
		default: "",
	},
});

//
// Functions
//
// ========================================================================
const getClass = (type) => {
	switch (type) {
		case "success":
			return "uk-alert-success";
		case "error":
			return "uk-alert-danger";
		case "warning":
			return "uk-alert-warning";
		default:
			return "uk-alert-primary";
	}
};
</script>

<style lang="scss" scoped></style>
