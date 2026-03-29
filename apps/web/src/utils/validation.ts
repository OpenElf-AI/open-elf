export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validators = {
  required: (message = '此字段为必填项'): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  phone: (message = '请输入正确的手机号'): ValidationRule => ({
    validate: (value) => /^1[3-9]\d{9}$/.test(value),
    message,
  }),

  email: (message = '请输入正确的邮箱地址'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= min,
    message: message || `最少需要 ${min} 个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= max,
    message: message || `最多允许 ${max} 个字符`,
  }),

  minNumber: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `数值不能小于 ${min}`,
  }),

  url: (message = '请输入正确的URL地址'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),
};

export const validateField = (
  value: string,
  rules: ValidationRule[]
): ValidationResult => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return { isValid: false, message: rule.message };
    }
  }
  return { isValid: true };
};

export const useFieldValidation = (rules: ValidationRule[]) => {
  const [touched, setTouched] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [validation, setValidation] = React.useState<ValidationResult>({ isValid: true });

  React.useEffect(() => {
    if (touched) {
      setValidation(validateField(value, rules));
    }
  }, [value, rules, touched]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const reset = () => {
    setValue('');
    setTouched(false);
    setValidation({ isValid: true });
  };

  return {
    value,
    setValue: handleChange,
    onBlur: handleBlur,
    touched,
    error: touched && !validation.isValid ? validation.message : undefined,
    isValid: validation.isValid,
    reset,
  };
};

import React from 'react';
