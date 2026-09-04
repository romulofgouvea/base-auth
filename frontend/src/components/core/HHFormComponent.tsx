import React, { useEffect } from 'react';
import {
  useForm,
  FormProvider,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { ApiError } from '../../services/ApiClient';

interface HHFormProps<T extends FieldValues> {
  id?: string;
  className?: string;
  defaultValues?: DefaultValues<T>;
  /** Zod schema for client-side validation. Omit to rely on per-field `rules` instead. */
  schema?: ZodType<T, T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  /**
   * Mirrors `formState.isSubmitting` to a parent that renders its submit/cancel
   * buttons outside this component's children (e.g. a modal's separate `footer` slot).
   */
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function HHForm<T extends FieldValues>({
  id,
  className,
  defaultValues,
  schema,
  onSubmit,
  children,
  onSubmittingChange,
}: HHFormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    resolver: schema ? (zodResolver(schema) as Resolver<T>) : undefined,
  });
  const isSubmitting = methods.formState.isSubmitting;
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const submit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Field-level errors only — generic/contextless messages are already surfaced
      // by the API client's global toast notification, so no banner is rendered here.
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach(({ context, message }) => {
          if (context) {
            methods.setError(context as Path<T>, { type: 'server', message });
          }
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <form id={id} className={className} onSubmit={submit} noValidate>
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
}
