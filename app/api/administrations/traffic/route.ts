import { NextResponse } from 'next/server';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { handleRouteError } from '@/lib/api/response';
import { getTrafficSnapshot } from '@/lib/travel/traffic';

export async function GET() {
  try {
    const context=await requireOrganizationContext();
    const permission=await requireApiPermission('cms','view',context.organizationId);
    if(!permission.ok)return permission.response;
    return NextResponse.json({data:await getTrafficSnapshot(context.organizationId)},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return handleRouteError('[TRAFFIC_GET]',error);}
}
