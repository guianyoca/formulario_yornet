<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        Formulario enviado correctamente
      </v-card-title>
      <v-card-text class="pa-4">
        <p>Los datos se han enviado correctamente:</p>
        <v-list>
          <v-list-item v-for="(value, key) in formValues" :key="key">
            <v-list-item-title>{{ getFieldLabel(key) }}: {{ value }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="$emit('update:modelValue', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  formValues: {
    type: Object,
    required: true
  },
  getFieldLabel: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
</script>
