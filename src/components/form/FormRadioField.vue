<template>
  <v-radio-group
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :label="field.label"
    :rules="rules"
    :required="field.required"
    :disabled="field.disabled"
    :readonly="field.readonly"
    density="comfortable"
  >
    <v-radio
      v-for="option in field.options"
      :key="option"
      :label="option"
      :value="option"
    ></v-radio>
  </v-radio-group>
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
    type: [String, Number],
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
      }
    });
  }
  
  return rules;
};

const rules = computed(() => generateRules(props.field, props.formValues));
</script>
