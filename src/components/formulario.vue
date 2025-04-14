<template>
  <DynamicForm
    :form-title="formTitle"
    :form-fields="formFields"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormField } from '@/types/form';
import fieldsData from '@/assets/fields.json';
import DynamicForm from '@/components/form/DynamicForm.vue';

// Datos del formulario
const formTitle = ref<string>(fieldsData.formTitle);
const formFields = ref<FormField[]>(fieldsData.fields);
</script>