import { FormField, ValidationRule } from '@/types/form';

export function useValidation() {
  // Función para generar las reglas de validación dinámicamente
  const generateRules = (field: FormField, formValues: Record<string, any>) => {
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

  // Función para agregar dinámicamente una nueva validación a un campo
  const addValidation = (field: FormField, validation: ValidationRule): void => {
    field.validations.push(validation);
  };

  return {
    generateRules,
    addValidation
  };
}
