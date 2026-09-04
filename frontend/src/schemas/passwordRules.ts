export const passwordStrengthErrors = (password: string): string[] => {
  if (password.length === 0) return ['Senha é obrigatório.'];

  const errors: string[] = [];

  if (password.length < 8) errors.push('A senha deve ter no mínimo 8 caracteres.');
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra maiúscula (A-Z) e uma letra minúscula (a-z).');
  if (!/[0-9]/.test(password)) errors.push('A senha deve conter pelo menos um número (0-9).');
  if (!/[!@#$%^&*()\-_=+[\]{};:,.<>?]/.test(password)) errors.push('A senha deve conter pelo menos um caractere especial.');
  if (/\s/.test(password)) errors.push('A senha não pode conter espaços em branco.');

  const commonSequences = ['123456', '12345678', '123456789', 'abcdef', 'qwerty', 'password', 'senha123'];
  const pwdLower = password.toLowerCase();
  for (const seq of commonSequences) {
    if (pwdLower.includes(seq)) {
      errors.push('A senha não deve utilizar sequências comuns (ex: 123456, abcdef, qwerty).');
      break;
    }
  }

  return errors;
};
