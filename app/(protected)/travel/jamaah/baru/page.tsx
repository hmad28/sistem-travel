import { PageShell } from '@/components/layout';
import { PilgrimForm } from '@/components/travel/pilgrim-form';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { redirect } from '@/i18n/navigation';

export default async function NewPilgrimPage() {
  const context = await requireOrganizationContext();
  if (!hasSessionPermission(context.user, 'pilgrim', 'create', context.organizationId)) {
    redirect({ href: '/travel/jamaah', locale: 'id' });
  }

  return (
    <PageShell
      title="Tambah jamaah baru"
      description="Mulai dari data yang paling penting. Biodata dan dokumen dapat dilengkapi bertahap."
    >
      <PilgrimForm />
    </PageShell>
  );
}
