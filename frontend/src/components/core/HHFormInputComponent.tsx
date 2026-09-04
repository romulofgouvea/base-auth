import React from 'react';
import { useFormContext, useController, type RegisterOptions } from 'react-hook-form';
import { HHInput } from './HHInputComponent';

interface HHFormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue'> {
  name: string;
  label: string;
  hint?: string;
  rules?: RegisterOptions;
  /** Transforms the raw input value (e.g. an input mask) before it reaches the form state. */
  format?: (value: string) => string;
}

export const HHFormInput: React.FC<HHFormInputProps> = ({ name, rules, format, ...props }) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control, rules });
  const onChange = format
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = format(e.target.value);
      field.onChange(e);
    }
    : field.onChange;
  return <HHInput {...props} {...field} onChange={onChange} error={fieldState.error?.message} />;
};
