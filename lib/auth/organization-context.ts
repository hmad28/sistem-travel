import 'server-only';

import { auth } from '@/auth';
import type { OrganizationMembership, SessionUser } from './types';

export class OrganizationAccessError extends Error {
  constructor(message: string, public readonly status: 401 | 403 = 403) {
    super(message);
    this.name = 'OrganizationAccessError';
  }
}

function selectMembership(user: SessionUser, preferredOrganizationId?: string) {
  const memberships = user.memberships ?? [];

  if (preferredOrganizationId) {
    return memberships.find(
      (membership: OrganizationMembership) =>
        membership.organization.id === preferredOrganizationId
    );
  }

  return memberships[0];
}

/**
 * Sumber konteks tenant tunggal untuk server component, action, dan route.
 * Organization ID selalu diverifikasi terhadap membership session.
 */
export async function requireOrganizationContext(preferredOrganizationId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new OrganizationAccessError('Anda harus masuk terlebih dahulu.', 401);
  }

  const membership = selectMembership(session.user, preferredOrganizationId);
  if (!membership) {
    throw new OrganizationAccessError('Akun Anda belum terhubung dengan travel.');
  }

  return {
    session,
    user: session.user,
    membership,
    organization: membership.organization,
    organizationId: membership.organization.id,
  };
}
