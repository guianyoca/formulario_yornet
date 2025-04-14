export interface ValidationRule {
  type: string;
  message: string;
  value?: number;
  pattern?: string;
  rules?: Record<string, boolean>;
  dependsOn?: string;
  condition?: string;
  conditionValue?: any;
}

export interface FormField {
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

export interface FormConfig {
  formTitle: string;
  fields: FormField[];
}

export interface NewValidation extends ValidationRule {
  fieldName: string;
}
