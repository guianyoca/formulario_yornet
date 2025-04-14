<template>
  <v-select
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :label="field.label"
    :items="field.options"
    :rules="rules"
    :required="field.required"
    :disabled="field.disabled"
    :readonly="field.readonly"
    variant="outlined"
    density="comfortable"
    validate-on="input"
  ></v-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FormField, ValidationRule } from '@/types/form';

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, Array],
    default: null
  },
  formValues: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const generateRules = (field, formValues) => {
  const rules = [];
  
  if (field.validations) {
    field.validations.forEach(validation => {
      switch (validation.type) {
        case 'required':
          rules.push(value => !!value || validation.message);
          break;
        case 'minLength':
          rules.push(value => !value || String(value).length >= (validation.value || 0) || validation.message);
          break;
        case 'maxLength':
          rules.push(value => !value || String(value).length <= (validation.value || 0) || validation.message);
          break;
      }
    });
  }
  
  return rules;
};

const rules = computed(() => generateRules(props.field, props.formValues));
</script>
