<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Agregar validación dinámica
      </v-card-title>
      <v-card-text class="pa-4">
        <v-form ref="form">
          <v-select
            v-model="validation.fieldName"
            :items="getFieldNames()"
            label="Campo a validar"
            required
            variant="outlined"
          ></v-select>

          <v-select
            v-model="validation.type"
            :items="['required', 'minLength', 'maxLength', 'regex', 'conditional']"
            label="Tipo de validación"
            required
            variant="outlined"
          ></v-select>

          <v-text-field
            v-if="validation.type === 'minLength' || validation.type === 'maxLength'"
            v-model.number="validation.value"
            label="Valor"
            type="number"
            required
            variant="outlined"
          ></v-text-field>

          <v-text-field
            v-if="validation.type === 'regex'"
            v-model="validation.pattern"
            label="Patrón regex"
            required
            variant="outlined"
          ></v-text-field>

          <template v-if="validation.type === 'conditional'">
            <v-select
              v-model="validation.dependsOn"
              :items="getFieldNames()"
              label="Campo dependiente"
              required
              variant="outlined"
            ></v-select>

            <v-select
              v-model="validation.condition"
              :items="['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']"
              label="Condición"
              required
              variant="outlined"
            ></v-select>

            <v-text-field
              v-model="validation.conditionValue"
              label="Valor de la condición"
              required
              variant="outlined"
            ></v-text-field>
          </template>

          <v-text-field
            v-model="validation.message"
            label="Mensaje de error"
            required
            variant="outlined"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="confirm">
          Agregar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormField, NewValidation } from '@/types/form';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  validation: {
    type: Object,
    required: true
  },
  fields: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const form = ref(null);

// Función auxiliar para obtener los nombres de los campos
const getFieldNames = () => {
  return props.fields.map((field) => {
    // Aseguramos que field sea tratado como FormField
    const typedField = field as FormField;
    return typedField.name;
  });
};

const confirm = () => {
  if (!props.validation.fieldName || !props.validation.type || !props.validation.message) {
    alert('Por favor, complete todos los campos requeridos');
    return;
  }
  
  emit('confirm');
};
</script>
