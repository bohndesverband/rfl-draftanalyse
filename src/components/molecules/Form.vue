<template>
	<form @submit.prevent="submitForm" v-if="showForm()" :class="props.class">
		<template v-if="fieldsets && fieldsets.length">
			<fieldset
				v-for="(fieldset, index) in fieldsets"
				:key="'fieldset-' + index"
				class="uk-fieldset uk-margin"
				data-uk-grid
			>
				<legend v-if="fieldset.legend" class="uk-legend">
					{{ fieldset.legend }}
				</legend>

				<slot v-for="(fieldId, key) in fieldset.fields">
					<div
						v-if="!fields[fieldId]?.hidden"
						class="uk-width-1-1"
						:class="fields[fieldId].width"
						:key="key"
					>
						<Fields
							:field="{
								data: { ...fields[fieldId] },
								key: fieldId,
							}"
							v-model="fields[fieldId].value"
						/>
					</div>
				</slot>
			</fieldset>
		</template>

		<div v-else data-uk-grid>
			<slot v-for="(field, key) in fields">
				<div
					v-if="!field.hidden"
					class="uk-width-1-1"
					:class="field.width"
					:key="key"
				>
					<Fields
						:field="{ data: { ...field }, key: key }"
						v-model="field.value"
					/>
				</div>
			</slot>
		</div>

		<Button v-if="button" :button="button" />

		<div
			v-if="formErrorMessage"
			class="uk-alert uk-alert-danger uk-text-center uk-margin-top"
		>
			{{ formErrorMessage }}
		</div>
	</form>

	<div
		v-if="formSuccessMessage"
		class="uk-alert uk-alert-success uk-text-center"
	>
		{{ formSuccessMessage }}
	</div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import { ref, watch } from "vue";
import Fields from "@/components/atoms/Fields.vue";
import Button from "@/components/atoms/Button.vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	fields: {
		type: Object,
		required: true,
	},
	fieldsets: {
		type: Array,
		default: null,
	},
	button: {
		type: String,
	},
	formErrorMessage: {
		type: String,
	},
	formSuccessMessage: {
		type: String,
	},
	hideFormOnMessage: {
		type: Boolean,
		default: true,
	},
	class: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["submit", "change", "reset"]);
const formErrorMessage = ref(props.formErrorMessage);

//
// Functions
//
// ========================================================================

watch(
	() => props.formErrorMessage,
	(newValue, oldValue) => {
		formErrorMessage.value = newValue;
	},
);

watch(
	() => props.fields,
	(newFields) => {
		emit("change", newFields);
	},
	{ deep: true },
);

const submitForm = async () => {
	// console.log(event.submitter.id);

	if (event.submitter.id === "reset") {
		emit("reset");
		return;
	}

	// Error handling
	// ========================================================================

	// keine email
	if (
		props.fields.email &&
		!props.fields?.email?.value &&
		props.fields.email.required
	) {
		formErrorMessage.value = "Bitte gib eine E-Mail an";
		return;
	}

	// kein passwort
	if (props.fields.password && !props.fields?.password?.value) {
		formErrorMessage.value = "Bitte gib ein Passwort an";
		return;
	}

	// passwörter stimmen nicht überein
	if (
		props.fields?.confirmPassword &&
		props.fields?.password?.value !== props.fields?.confirmPassword?.value
	) {
		formErrorMessage.value = "Die Passwörter stimmen nicht überein";
		return;
	}

	emit("submit", { fields: props.fields, id: event.submitter.id });
};

const showForm = () => {
	if (props.hideFormOnMessage == false) {
		return true;
	} else if (props.hideFormOnMessage == true && props.formSuccessMessage) {
		return false;
	}

	return true;
};
</script>

<style lang="scss" scoped>
.uk-fieldset {
	border: 1px solid var(--wp--preset--color--grey);
	padding: 20px;
	margin-bottom: 20px;
}

.uk-legend {
	font-weight: bold;
	font-size: 1.2em;
	padding: 0 10px;
}

form + .uk-alert {
	margin-top: 1rem;
}
</style>

<style lang="scss">
div.uk-margin:not(:has(> label)) {
	margin-top: 0 !important;
}
</style>
