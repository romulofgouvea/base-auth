import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { profileService } from '../services/ProfileService';
import { useAuth } from '../context/AuthContext';
import { HHButton } from '../components/core/HHButtonComponent';
import { HHForm } from '../components/core/HHFormComponent';
import { HHFormInput } from '../components/core/HHFormInputComponent';
import type { ProfileData } from '../models/ProfileModel';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const HHProfilePage: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    profileService
      .get()
      .then(setProfile)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Meu Perfil</span>
        <Link to="/home" className="text-sm text-brand-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          ← Voltar
        </Link>
      </header>

      <main className="max-w-lg mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {isLoading || !profile ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
          ) : (
            <HHForm<ProfileFormValues>
              schema={profileSchema}
              defaultValues={{
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone ?? '',
              }}
              onSubmit={async (data) => {
                const updated = await profileService.update(data);
                setProfile(updated);
                updateUser({ name: `${updated.firstName} ${updated.lastName}`.trim() });
              }}
            >
              {(methods) => (
                <>
                  <HHFormInput id="firstName" name="firstName" label="Nome" placeholder="Seu nome" />
                  <HHFormInput id="lastName" name="lastName" label="Sobrenome" placeholder="Seu sobrenome" />
                  <HHFormInput id="phone" name="phone" label="Telefone" placeholder="(00) 00000-0000" />

                  <HHButton type="submit" disabled={methods.formState.isSubmitting} color="primary" isFullWidth={true}>
                    {methods.formState.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                  </HHButton>
                </>
              )}
            </HHForm>
          )}
        </div>
      </main>
    </div>
  );
};
