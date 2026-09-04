import React from 'react';
import { useFormContext, useController, type RegisterOptions } from 'react-hook-form';
import { HHCheckbox } from './HHCheckboxComponent';

interface HHFormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'checked' | 'defaultValue'> {
  name: string;
  label: string;
  rules?: RegisterOptions;
}

export const HHFormCheckbox: React.FC<HHFormCheckboxProps> = ({ name, rules, ...props }) => {
  const { control } = useFormContext();
  // `value` is pulled out (not spread) because `checked` needs the boolean mapping below;
  // spreading the rest (including `ref`) avoids the react-hooks/refs lint rule, which flags
  // explicit member access on an object that also carries a `.ref` key.
  const { field: { value, ...field } } = useController({ name, control, rules });
  return <HHCheckbox {...props} {...field} checked={!!value} />;
};
