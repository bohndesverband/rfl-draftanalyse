<template>
	<div class="uk-container uk-padding">
		<h1 class="uk-heading-primary">Draftanalyse bearbeiten</h1>

		<Button
			v-if="supabaseData.currentUser"
			:button="{
				class: 'uk-position-top-right uk-position-medium',
				label: 'Logout',
			}"
			@click="logout"
		/>

		<div data-uk-grid>
			<div class="uk-width-1-3@m">
				<div class="uk-text-meta uk-text-uppercase uk-margin-small-bottom">
					RFL Tools
				</div>

				<div class="uk-button-group">
					<a
						class="uk-button uk-button-secondary"
						href="https://jakesch.shinyapps.io/rfl-tools/#section-draftklassen"
						target="_blank"
						>Draftklassen</a
					>
					<a
						class="uk-button uk-button-secondary"
						href="https://jakesch.shinyapps.io/rfl-tools/#section-draftboards"
						target="_blank"
						>Draftboards</a
					>
				</div>
			</div>

			<div class="uk-width-expand@m">
				<Filter />
			</div>
		</div>

		<hr />
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Button from "@/components/atoms/Button.vue";
import Filter from "@/components/organisms/forms/Filter.vue";

import { useSupabaseStore } from "@/store/supabase";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();

//
// Functions
//
// ========================================================================

const logout = async () => {
	await supabaseData.signOut();
};
</script>

<style lang="scss" scoped>
.uk-button-group {
	gap: 2px;
	flex-wrap: wrap;
}
</style>
