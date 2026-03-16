<template>
	<div data-uk-lightbox>
		<a :href="imageUrl">
			<img :src="imageUrl" class="uk-width-1-1" :title="image.title" />
		</a>
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import { useSupabaseStore } from "@/store/supabase";
import { onMounted, ref } from "vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	image: {
		type: Object,
		required: true,
	},
});

const supabaseData = useSupabaseStore();
const imageUrl = ref(props.image.url);

//
// Functions
//
// ========================================================================

onMounted(async () => {
	if (props.image?.pick) {
		imageUrl.value = await supabaseData.fetchFile(props.image.pick);
	}
});
</script>

<style lang="scss"></style>
