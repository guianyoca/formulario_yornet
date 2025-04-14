import { ref, reactive, watch } from 'vue';
import { FormField, ValidationRule, NewValidation } from '@/types/form';

export function useForm(formFields: FormField[]) {
  const form = ref<any>(null);
  const isFormValid = ref<boolean>(false);
  const isSubmitting = ref<boolean>(false);
  const submitError = ref<string | null>(null);
  const dialogVisible = ref<boolean>(false);
  
  // Valores del formulario
  const formValues = reactive<Record<string, any>>({});
  
  // Inicializar los valores del formulario con los valores por defecto
  const initFormValues = () => {
    formFields.forEach(field => {
      formValues[field.name] = field.default;
    });
  };
  
  // Función para verificar si un campo debe mostrarse basado en condiciones
  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditionalDisplay) return true;
    
    const { dependsOn, value } = field.conditionalDisplay;
    return formValues[dependsOn] === value;
  };
  
  // Función para obtener la etiqueta de un campo por su nombre
  const getFieldLabel = (fieldName: string): string => {
    const field = formFields.find(f => f.name === fieldName);
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
  
  // Observar cambios en los valores del formulario para aplicar validaciones condicionales
  watch(formValues, (newValues) => {
    // Implementar lógica para validaciones condicionales
    if (newValues.vivienda === 'Departamento') {
      const telefonoField = formFields.find(f => f.name === 'telefono');
      if (telefonoField) {
        const hasConditionalValidation = telefonoField.validations.some(
          v => v.type === 'conditional' && v.dependsOn === 'vivienda'
        );
        
        if (!hasConditionalValidation) {
          telefonoField.validations.push({
            type: 'conditional',
            dependsOn: 'vivienda',
            condition: 'equals',
            conditionValue: 'Departamento',
            message: 'Para departamentos, el teléfono debe tener al menos 8 dígitos.',
          });
        }
      }
    }
  }, { deep: true });
  
  return {
    form,
    formValues,
    isFormValid,
    isSubmitting,
    submitError,
    dialogVisible,
    shouldShowField,
    getFieldLabel,
    submitForm,
    resetForm,
    initFormValues
  };
}
