import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { OrganizationAccessError } from '@/lib/auth/organization-context';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    return { ok: true as const, data: schema.parse(body) };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false as const,
        response: jsonError(error.issues[0]?.message ?? 'Invalid request body', 400),
      };
    }

    return { ok: false as const, response: jsonError('Invalid JSON body', 400) };
  }
}

export function handleRouteError(scope: string, error: unknown) {
  if (error instanceof OrganizationAccessError) {
    return jsonError(error.message, error.status);
  }
  console.error(scope, error);
  return jsonError('Internal server error', 500);
}
