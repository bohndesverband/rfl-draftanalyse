<template>
	<div
		class="uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-padding-small grade"
		:data-grade="grade"
	>
		<span>Note</span>
		<span>{{ grade }}</span>
	</div>
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
	grade: {
		type: String,
		required: true,
	},
});

//
// Functions
//
// ========================================================================
</script>

<style lang="scss" scoped>
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
		translate: calc(10% + attr(data-grade %) * -80 / 5);
		bottom: 0;
		background: linear-gradient(
			90deg,
			rgba(42, 123, 155, 1) 15%,
			rgba(124, 204, 121, 1) 30%,
			rgba(210, 210, 108, 1) 40%,
			rgba(218, 152, 90, 1) 60%,
			rgba(237, 83, 83, 1) 100%
		);
		z-index: 0;
	}
}
</style>
