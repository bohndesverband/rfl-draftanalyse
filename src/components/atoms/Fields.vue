<template>
	<slot v-if="field.data.type != 'checkbox'">
		<label
			v-if="
				field.data.type != 'submit' &&
				field.data.type != 'reset' &&
				field.data.label
			"
			class="uk-form-label"
			:for="field.key"
			>{{ field.data.label }}</label
		>
		<div
			v-if="field.data.type != 'submit' && field.data.type != 'reset'"
			class="uk-form-controls"
		>
			<textarea
				v-if="field.data.type == 'textarea'"
				class="uk-textarea"
				:id="field.key"
				:required="field.data.required"
				:value="fieldValue"
				:rows="field.data.rows || 5"
				@input="updateValue($event.target.value)"
			></textarea>

			<select
				v-if="field.data.type == 'select'"
				class="uk-select"
				:id="field.key"
				:required="field.data.required"
				:disabled="field.data.disabled"
				:value="fieldValue"
				@change="updateValue($event.target.value)"
			>
				<option
					v-for="option in field.data.options"
					:value="option.value"
					:key="option.value"
					:disabled="option.disabled"
				>
					{{ option.text }}
				</option>
			</select>

			<input
				v-if="
					field.data.type != 'textarea' &&
					field.data.type != 'select' &&
					field.data.type != 'checkbox'
				"
				class="uk-input"
				:value="fieldValue"
				:type="field.data.type"
				:autocomplete="field.data.autocomplete"
				:maxlength="field.data.maxlength"
				:required="field.data.required"
				:disabled="field.data.disabled ? field.data.disabled : false"
				:id="field.key"
				@input="updateValue($event.target.value)"
			/>
		</div>
	</slot>

	<slot v-if="field.data.type == 'checkbox'">
		<label :for="field.key">
			<input
				v-if="field.data.type == 'checkbox'"
				class="uk-checkbox"
				type="checkbox"
				:required="field.data.required"
				:disabled="field.data.disabled ? field.data.disabled : false"
				:id="field.key"
				:checked="fieldValue"
				@change="updateValue($event.target.checked)"
			/>

			{{ field.data.label }}
		</label>
	</slot>

	<Button
		v-if="
			(field.data.type == 'submit' || field.data.type == 'reset') &&
			!field.data.hidden
		"
		:button="{
			key: field.key,
			label: field.data.label,
			type: field.data.type,
			class: field.data.class,
			formNoValidate: field.data.formNoValidate,
			disabled: field.data.disabled,
		}"
	/>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import { computed } from "vue";
import Button from "./Button.vue";

//
// Constants
//
// ========================================================================

const props = defineProps({
	field: {
		type: Object,
		required: true,
	},
	modelValue: {
		type: [String, Number, Boolean],
		default: undefined,
	},
});

const emit = defineEmits(["update:modelValue", "change"]);

//
// Computed
//
// ========================================================================

const fieldValue = computed(() => {
	// Wenn modelValue von außen übergeben wird, nutze diesen
	if (props.modelValue !== undefined) {
		return props.modelValue;
	}
	// Fallback auf field.data.value für Rückwärtskompatibilität
	return props.field.data.value;
});

//
// Functions
//
// ========================================================================

const updateValue = (value) => {
	// Emittiere das update:modelValue Event für v-model Support
	emit("update:modelValue", value);
	// Emittiere auch ein change Event für zusätzliche Flexibilität
	emit("change", value);

	// Update field.data.value für Rückwärtskompatibilität
	if (props.field.data) {
		props.field.data.value = value;
	}
};
</script>

<style lang="scss"></style>
