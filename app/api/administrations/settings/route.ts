import { NextResponse } from 'next/server';
import { asc, eq, notLike } from 'drizzle-orm';
import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { handleRouteError, parseJson, jsonError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { settingUpdateSchema } from '@/lib/validation/admin';
import { writeAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const authz = await requireApiPermission('setting', 'view');
    if (!authz.ok) return authz.response;

    const rows = await db.select().from(appSettings).where(notLike(appSettings.key, 'travel.%')).orderBy(asc(appSettings.key));
    return NextResponse.json(
      rows.map((setting) => ({
        ...setting,
        value: setting.isSecret ? '' : setting.value,
      }))
    );
  } catch (error) {
    return handleRouteError('[SETTINGS_GET]', error);
  }
}

export async function PUT(request: Request) {
  try {
    const authz = await requireApiPermission('setting', 'edit');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, settingUpdateSchema);
    if (!parsed.ok) return parsed.response;
    // Tenant CMS records must only be changed through organization-scoped actions.
    if (parsed.data.settings.some(setting => setting.key.startsWith('travel.'))) return jsonError('Forbidden', 403);

    await db.transaction(async (tx) => {
      for (const setting of parsed.data.settings) {
        await tx
          .update(appSettings)
          .set({
            value: setting.value,
            updatedById: authz.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(appSettings.key, setting.key));
      }
    });

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: 'settings.update',
      resource: 'setting',
      message: 'Application settings updated',
      metadata: { keys: parsed.data.settings.map((setting) => setting.key) },
    });

    const rows = await db.select().from(appSettings).where(notLike(appSettings.key, 'travel.%')).orderBy(asc(appSettings.key));
    return NextResponse.json(rows.map(setting => ({ ...setting, value: setting.isSecret ? '' : setting.value })));
  } catch (error) {
    return handleRouteError('[SETTINGS_PUT]', error);
  }
}
