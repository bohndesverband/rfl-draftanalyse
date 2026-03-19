<template>
	<ul class="uk-accordion-default" data-uk-accordion>
		<li>
			<a class="uk-accordion-title" href>+ Zeige Einschätzung von anderen</a>
			<div class="uk-accordion-content">
				<ul class="uk-list uk-list-striped">
					<Analyse
						v-for="analysis in data"
						:key="analysis.id"
						:data="analysis"
						:showEditButton="false"
					/>
				</ul>
			</div>
		</li>
	</ul>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Analyse from "@/components/organisms/Analyse.vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	data: {
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
