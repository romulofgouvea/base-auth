import React, { useState } from 'react';
import { z } from 'zod';
import { apiClient } from '../../services/ApiClient';
import { HHButton } from '../core/HHButtonComponent';
import { HHForm } from '../core/HHFormComponent';
import { HHFormInput } from '../core/HHFormInputComponent';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.').email('Formato de email inválido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const HHForgotPasswordForm: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mt-6 text-center">
        <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6 text-sm border border-green-200 dark:border-green-800">
          Enviamos um link de recuperação para o seu email. Por favor, verifique sua caixa de entrada e a pasta de spam.
        </div>
        <HHButton
          variant="ghost"
          color="primary"
          onClick={() => setIsSuccess(false)}
          className="text-sm w-full"
        >
          Tentar outro email
        </HHButton>
      </div>
    );
  }

  return (
    <HHForm<ForgotPasswordFormValues>
      className="w-full max-w-sm mt-6"
      schema={forgotPasswordSchema}
      defaultValues={{ email: '' }}
      onSubmit={async (data) => {
        try {
          await apiClient.post('/auth/forgot-password', { email: data.email });
          setIsSuccess(true);
        } catch {
          // Silenciado intencionalmente: não revelar se o email existe na base.
        }
      }}
    >
      {(methods) => (
        <>
          <HHFormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
          />

          <HHButton type="submit" disabled={methods.formState.isSubmitting} color="primary" isFullWidth={true}>
            {methods.formState.isSubmitting ? 'Enviando...' : 'Recuperar Senha'}
          </HHButton>
        </>
      )}
    </HHForm>
  );
};
