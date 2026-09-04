import React from 'react';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../services/ApiClient';
import { HHInput } from '../core/HHInputComponent';
import { passwordStrengthErrors } from '../../schemas/passwordRules';
import { decodeJwtEmail } from '../../utils/jwtUtils';
import { HHButton } from '../core/HHButtonComponent';
import { HHForm } from '../core/HHFormComponent';
import { HHFormInput } from '../core/HHFormInputComponent';

const buildResetPasswordSchema = (email: string) =>
  z
    .object({
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      const errors = passwordStrengthErrors(values.password);
      if (email && values.password.toLowerCase() === email.toLowerCase()) {
        errors.push('A senha não pode ser igual ao email.');
      }
      if (errors.length > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: errors.join(' '), path: ['password'] });
      }
      if (values.confirmPassword !== values.password) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'As senhas não coincidem.', path: ['confirmPassword'] });
      }
    });

type ResetPasswordFormValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;

export const HHResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = token ? decodeJwtEmail(token) ?? '' : '';

  return (
    <HHForm<ResetPasswordFormValues>
      className="w-full max-w-sm mt-6"
      schema={buildResetPasswordSchema(email)}
      defaultValues={{ password: '', confirmPassword: '' }}
      onSubmit={async (data) => {
        if (!token) return;
        try {
          await apiClient.post('/auth/reset-password', { token, newPassword: data.password });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:notification', {
              detail: { title: 'Sucesso', message: 'Senha redefinida com sucesso!', variant: 'success' },
            }));
          }

          navigate('/auth/login');
        } catch {
          // Silenciado intencionalmente, preservando o comportamento original.
        }
      }}
    >
      {(methods) => (
        <>
          <HHInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={email}
            disabled
            placeholder="seu@email.com"
          />

          <HHFormInput
            id="password"
            name="password"
            type="password"
            label="Nova Senha"
            placeholder="***"
          />

          <HHFormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmação da Senha"
            placeholder="***"
          />

          {!token && <p className="text-red-500 text-sm mb-4">Token de recuperação inválido ou ausente.</p>}

          <HHButton type="submit" disabled={methods.formState.isSubmitting || !token} color="primary" isFullWidth={true}>
            {methods.formState.isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
          </HHButton>
        </>
      )}
    </HHForm>
  );
};
