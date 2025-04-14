<template>
  <v-container class="fill-height" max-width="900">
    <h1 class="text-center mb-6">{{ formTitle }}</h1>
    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">
      <v-card class="pa-4">
        <!-- Mensaje de error al enviar -->
        <v-alert v-if="submitError" type="error" class="mb-4" closable>
          {{ submitError }}
        </v-alert>

        <v-row>
          <v-col 
            v-for="field in formFields" 
            :key="field.name" 
            cols="12" 
            :md="field.name === 'codArea' ? 4 : (field.name === 'telefono' ? 8 : 12)"
            v-show="shouldShowField(field)"
          >
            <!-- Campo de texto normal -->
            <FormTextField
              v-if="field.type === 'text'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />

            <!-- Campo de email -->
            <FormTextField
              v-else-if="field.type === 'email'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              type="email"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />

            <!-- Campo numérico -->
            <FormNumberField
              v-else-if="field.type === 'number'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />

            <!-- Campo seleccionable -->
            <FormSelectField
              v-else-if="field.type === 'selectable'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />

            <!-- Campo de checkbox -->
            <FormCheckboxField
              v-else-if="field.type === 'checkbox'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />

            <!-- Grupo de radio buttons -->
            <FormRadioField
              v-else-if="field.type === 'radio'"
              v-model="formValues[field.name]"
              :field="field"
              :form-values="formValues"
              @update:model-value="onFieldUpdate(field.name, $event)"
            />
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-center">
            <v-btn
              color="primary"
              type="submit"
              :loading="isSubmitting"
              :disabled="!isFormValid || isSubmitting"
              size="large"
              class="px-6"
            >
              Enviar
            </v-btn>
            <v-btn
              color="secondary"
              class="ml-4 px-6"
              size="large"
              @click="resetForm"
              :disabled="isSubmitting"
            >
              Limpiar
            </v-btn>
            <v-btn
              color="info"
              class="ml-4 px-6"
              size="large"
              @click="addDynamicValidation"
              :disabled="isSubmitting"
            >
              Agregar validación
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-form>

    <!-- Diálogo de confirmación -->
    <ConfirmationDialog
      v-model="dialogVisible"
      :form-values="formValues"
      :get-field-label="getFieldLabel"
    />

    <!-- Diálogo para agregar validación dinámica -->
    <ValidationDialog
      v-model="validationDialogVisible"
      :validation="newValidation"
      :fields="formFields"
      @confirm="confirmAddValidation"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

// Definir interfaces directamente para evitar problemas de importación
interface ValidationRule {
  type: string;
  message: string;
  value?: number;
  pattern?: string;
  rules?: Record<string, boolean>;
  dependsOn?: string;
  condition?: string;
  conditionValue?: any;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  default: any;
  maxLength?: number;
  required: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: string[];
  validations: ValidationRule[];
  conditionalDisplay?: {
    dependsOn: string;
    value: any;
  };
}

// Importar componentes usando rutas absolutas para evitar errores 500
import FormTextField from '@/components/form/FormTextField.vue';
import FormNumberField from '@/components/form/FormNumberField.vue';
import FormSelectField from '@/components/form/FormSelectField.vue';
import FormCheckboxField from '@/components/form/FormCheckboxField.vue';
import FormRadioField from '@/components/form/FormRadioField.vue';
import ValidationDialog from '@/components/form/ValidationDialog.vue';
import ConfirmationDialog from '@/components/form/ConfirmationDialog.vue';

const props = defineProps<{
  formTitle: string;
  formFields: FormField[];
}>();

// Implementar directamente las funciones que necesitamos
// Estado del formulario
const form = ref<any>(null);
const isFormValid = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const submitError = ref<string | null>(null);
const dialogVisible = ref<boolean>(false);
const validationDialogVisible = ref<boolean>(false);

// Valores del formulario
const formValues = reactive<Record<string, any>>({});

// Estructura para nueva validación
const newValidation = reactive<ValidationRule & { fieldName: string }>({
  fieldName: '',
  type: 'required',
  message: '',
  value: undefined,
  pattern: undefined,
  dependsOn: undefined,
  condition: undefined,
  conditionValue: undefined
});

// Función para verificar si un campo debe mostrarse basado en condiciones
const shouldShowField = (field: FormField): boolean => {
  if (!field.conditionalDisplay) return true;
  
  const { dependsOn, value } = field.conditionalDisplay;
  return formValues[dependsOn] === value;
};

// Función para generar las reglas de validación dinámicamente
const generateRules = (field: FormField) => {
  const rules: ((value: any) => boolean | string)[] = [];
  
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
        case 'regex':
          if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            rules.push(value => !value || regex.test(value) || validation.message);
          }
          break;
        case 'complex':
          if (validation.rules?.noNumbers) {
            rules.push(value => !value || !/\d/.test(value) || validation.message);
          }
          break;
        case 'conditional':
          if (validation.dependsOn && validation.condition === 'equals' && validation.conditionValue !== undefined) {
            rules.push(value => {
              if (formValues[validation.dependsOn as string] !== validation.conditionValue) return true;
              // Aplicar validación adicional solo si la condición se cumple
              if (validation.type === 'minLength') {
                return String(value).length >= 8 || validation.message;
              }
              return true;
            });
          }
          break;
      }
    });
  }
  
  return rules;
};

// Función para obtener la etiqueta de un campo por su nombre
const getFieldLabel = (fieldName: string): string => {
  const field = props.formFields.find(f => f.name === fieldName);
  return field ? field.label : fieldName;
};

// Función para simular el envío a una API
const simulateApiSubmit = async (data: Record<string, any>): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Simular una llamada a API con un retraso aleatorio
    setTimeout(() => {
      // 90% de probabilidad de éxito
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error('Error al enviar los datos. Por favor, inténtelo de nuevo.'));
      }
    }, 1500);
  });
};

// Función para enviar el formulario
const submitForm = async () => {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  
  if (valid) {
    isSubmitting.value = true;
    submitError.value = null;
    
    try {
      await simulateApiSubmit(formValues);
      console.log('Formulario enviado:', formValues);
      // Guardar en localStorage como respaldo
      localStorage.setItem('formData', JSON.stringify(formValues));
      dialogVisible.value = true;
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      isSubmitting.value = false;
    }
  }
};

// Función para resetear el formulario
const resetForm = () => {
  if (!form.value) return;
  
  form.value.reset();
  initFormValues();
  submitError.value = null;
};

// Inicializar los valores del formulario con los valores por defecto
const initFormValues = () => {
  props.formFields.forEach(field => {
    formValues[field.name] = field.default;
  });
};

// Función para mostrar el diálogo de agregar validación
const addDynamicValidation = (): void => {
  // Reiniciar el objeto de nueva validación
  Object.assign(newValidation, {
    fieldName: '',
    type: 'required',
    message: '',
    value: undefined,
    pattern: undefined,
    dependsOn: undefined,
    condition: undefined,
    conditionValue: undefined
  });
  
  // Mostrar el diálogo
  validationDialogVisible.value = true;
};

// Función para confirmar la adición de una nueva validación
const confirmAddValidation = (): void => {
  // Validar que todos los campos necesarios estén completos
  if (!newValidation.fieldName || !newValidation.type || !newValidation.message) {
    alert('Por favor, complete todos los campos requeridos');
    return;
  }
  
  // Crear el objeto de validación
  const validation: ValidationRule = {
    type: newValidation.type,
    message: newValidation.message
  };
  
  // Agregar propiedades adicionales según el tipo de validación
  if (newValidation.type === 'minLength' || newValidation.type === 'maxLength') {
    validation.value = newValidation.value;
  } else if (newValidation.type === 'regex') {
    validation.pattern = newValidation.pattern;
  } else if (newValidation.type === 'conditional') {
    validation.dependsOn = newValidation.dependsOn;
    validation.condition = newValidation.condition;
    validation.conditionValue = newValidation.conditionValue;
  }
  
  // Agregar la validación al campo seleccionado
  const field = props.formFields.find(f => f.name === newValidation.fieldName);
  if (field) {
    field.validations.push(validation);
    console.log(`Validación agregada al campo ${newValidation.fieldName}:`, validation);
  }
  
  // Cerrar el diálogo
  validationDialogVisible.value = false;
};

// Función para manejar la actualización de campos
const onFieldUpdate = (fieldName: string, value: any): void => {
  // Actualizar el valor en el objeto formValues
  formValues[fieldName] = value;
};

// Inicializar valores del formulario
onMounted(() => {
  initFormValues();
});
</script>

<style scoped>
.v-container {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
