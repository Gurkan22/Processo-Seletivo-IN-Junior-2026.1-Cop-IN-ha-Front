import { z } from 'zod';

/*
  Detecta sequências de pelo menos 3 caracteres, crescentes ou
  decrescentes, tanto em letras quanto em números (ex: "abc", "cba",
  "123", "321").
*/
function hasSequence(value: string): boolean {
  for (let i = 0; i < value.length - 2; i += 1) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);

    const ascending = b === a + 1 && c === b + 1;
    const descending = b === a - 1 && c === b - 1;

    if (ascending || descending) return true;
  }
  return false;
}

// Regras da senha:
// - pelo menos 8 caracteres não nulos;
// - pelo menos 1 minúscula, 1 maiúscula, 1 número, 1 letra, 1 símbolo;
// - sem espaços ou acentos;
// - sem sequências, ex: abcd, 1234;
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail.')
    .email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(1, 'Informe a senha.')
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .regex(/[a-z]/, 'A senha deve ter ao menos uma letra minúscula.')
    .regex(/[A-Z]/, 'A senha deve ter ao menos uma letra maiúscula.')
    .regex(/[0-9]/, 'A senha deve ter ao menos um número.')
    .regex(/[^A-Za-z0-9\s]/, 'A senha deve ter ao menos um símbolo.')
    .regex(/^\S+$/, 'A senha não pode conter espaços.')
    .refine((value) => /^[\x20-\x7E]*$/.test(value), {
      message: 'A senha não pode conter acentos.',
    })
    .refine((value) => !hasSequence(value), {
      message: 'A senha não pode conter sequências (ex: abcd, 1234).',
    }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !formatted[field]) {
      formatted[field] = issue.message;
    }
  }
  return formatted;
}
