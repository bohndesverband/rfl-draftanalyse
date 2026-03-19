<template>
	<!-- <pre>{{ data }}</pre> -->
	<Trade v-if="type === 'trade'" :data="data" />
	<Pick v-else :data="props.data" :showEditButton="showEditButton" />
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Trade from "@/components/organisms/analysen/Trade.vue";
import Pick from "@/components/organisms/analysen/Pick.vue";
import { ref, watch } from "vue";
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

const type = ref("pick");

//
// Functions
//
// ========================================================================

watch(
	() => props.data,
	(newData) => {
		if (newData) {
			const dataType = props.data.pick;

			if (dataType.includes("trade")) {
				type.value = "trade";
			} else if (dataType.includes("klasse")) {
				type.value = "klasse";
			} else {
				type.value = "pick";
			}
		}
	},
	{ immediate: true },
);

// Helper
// ========================================================================
</script>

<style lang="scss" scoped></style>
