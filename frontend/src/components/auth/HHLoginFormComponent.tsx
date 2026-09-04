import React from 'react';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passwordStrengthErrors } from '../../schemas/passwordRules';
import { STORAGE_KEYS } from '../../constants/storage';
import { ApiError } from '../../services/ApiClient';
import { HHButton } from '../core/HHButtonComponent';
import { HHForm } from '../core/HHFormComponent';
import { HHFormInput } from '../core/HHFormInputComponent';
import { HHFormCheckbox } from '../core/HHFormCheckboxComponent';

const loginSchema = z
  .object({
    email: z.string().min(1, 'Email é obrigatório.').email('Formato de email inválido'),
    password: z.string(),
    rememberMe: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const errors = passwordStrengthErrors(values.password);
    if (values.password && values.password.toLowerCase() === values.email.toLowerCase()) {
      errors.push('A senha não pode ser igual ao email.');
    }
    if (errors.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: errors.join(' '), path: ['password'] });
    }
  });

type LoginFormValues = z.infer<typeof loginSchema>;

export const HHLoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const savedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';

  return (
    <HHForm<LoginFormValues>
      className="w-full max-w-sm mt-6"
      schema={loginSchema}
      defaultValues={{ email: savedEmail, password: '', rememberMe: !!savedEmail }}
      onSubmit={async (data) => {
        const result = await login(data.email, data.password);
        if (!result.success) {
          throw new ApiError(result.error ?? 'Login failed', 0, result.validationErrors);
        }
        if (data.rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, data.email);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
        }
        navigate('/home');
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

          <HHFormInput
            id="password"
            name="password"
            type="password"
            label="Senha"
            placeholder="***"
          />

          <div className="flex items-center justify-between mb-6">
            <HHFormCheckbox id="rememberMe" name="rememberMe" label="Lembrar email" />
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Esqueci minha senha?
              </Link>
            </div>
          </div>

          <HHButton type="submit" disabled={methods.formState.isSubmitting} color="primary" isFullWidth={true}>
            {methods.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
          </HHButton>
        </>
      )}
    </HHForm>
  );
};
