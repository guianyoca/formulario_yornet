import { ref, reactive } from 'vue';
import { FormField, ValidationRule, NewValidation } from '@/types/form';

export function useDynamicValidation(formFields: FormField[]) {
  const validationForm = ref<any>(null);
  const validationDialogVisible = ref<boolean>(false);
  
  // Estructura para nueva validación
  const newValidation = reactive<NewValidation>({
    fieldName: '',
    type: 'required',
    message: '',
    value: undefined,
    pattern: undefined,
    dependsOn: undefined,
    condition: undefined,
    conditionValue: undefined
  });
  
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
    const field = formFields.find(f => f.name === newValidation.fieldName);
    if (field) {
      field.validations.push(validation);
      console.log(`Validación agregada al campo ${newValidation.fieldName}:`, validation);
    }
    
    // Cerrar el diálogo
    validationDialogVisible.value = false;
  };
  
  return {
    validationForm,
    validationDialogVisible,
    newValidation,
    addDynamicValidation,
    confirmAddValidation
  };
}
