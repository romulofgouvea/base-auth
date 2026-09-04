import React from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passwordStrengthErrors } from '../../schemas/passwordRules';
import { ApiError } from '../../services/ApiClient';
import { HHButton } from '../core/HHButtonComponent';
import { HHForm } from '../core/HHFormComponent';
import { HHFormInput } from '../core/HHFormInputComponent';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Formato de email inválido'),
    password: z.string(),
  })
  .superRefine((values, ctx) => {
    const errors = passwordStrengthErrors(values.password);
    if (values.password && values.password.toLowerCase() === values.email.toLowerCase()) {
      errors.push('A senha não pode ser igual ao email.');
    }
    if (values.password && values.password.toLowerCase() === values.name.toLowerCase()) {
      errors.push('A senha não pode ser igual ao nome.');
    }
    if (errors.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: errors.join(' '), path: ['password'] });
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const HHRegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <HHForm<RegisterFormValues>
      className="w-full max-w-sm mt-6"
      schema={registerSchema}
      defaultValues={{ name: '', email: '', password: '' }}
      onSubmit={async (data) => {
        const result = await register(data.name, data.email, data.password);
        if (!result.success) {
          const errors = (result.validationErrors ?? []).map((err) =>
            err.context === 'username' ? { ...err, context: 'name' } : err,
          );
          throw new ApiError(result.error ?? 'Registration failed', 0, errors.length > 0 ? errors : undefined);
        }
        navigate('/home');
      }}
    >
      {(methods) => (
        <>
          <HHFormInput
            id="name"
            name="name"
            type="text"
            label="Nome Completo"
            placeholder="Seu Nome"
          />

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

          <HHButton type="submit" disabled={methods.formState.isSubmitting} color="primary" isFullWidth={true}>
            {methods.formState.isSubmitting ? 'Criando conta...' : 'Cadastrar'}
          </HHButton>
        </>
      )}
    </HHForm>
  );
};
