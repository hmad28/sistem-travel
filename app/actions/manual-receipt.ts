'use server';
import { randomUUID } from 'node:crypto';
import { and,eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { payments,receipts,invoices,auditLogs } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import type { WorkflowState } from './travel-workflow';
export async function createManualReceipt(_state:WorkflowState,form:FormData):Promise<WorkflowState>{
  const t=await getTranslations('workflow');
  try{
    const ctx=await requireOrganizationContext(),org=ctx.organizationId;
    if(!hasSessionPermission(ctx.user,'finance','create',org))return {ok:false,message:t('denied')};
    const data=z.object({paymentId:z.uuid(),notes:z.string().trim().max(1000)}).parse(Object.fromEntries(form));
    const id=await db.transaction(async tx=>{
      const [payment]=await tx.select().from(payments).where(and(eq(payments.id,data.paymentId),eq(payments.organizationId,org))).for('update');
      if(!payment||payment.status!=='VERIFIED')throw new Error('Invalid payment');
      const [existing]=await tx.select().from(receipts).where(and(eq(receipts.paymentId,payment.id),eq(receipts.organizationId,org)));
      if(existing)return existing.id;
      const [invoice]=await tx.select().from(invoices).where(and(eq(invoices.id,payment.invoiceId),eq(invoices.organizationId,org)));
      if(!invoice||invoice.voidedAt||invoice.status==='VOID')throw new Error('Invalid invoice');
      const [created]=await tx.insert(receipts).values({organizationId:org,paymentId:payment.id,receiptNumber:`KWT-${randomUUID().slice(0,18).toUpperCase()}`,issuedBy:ctx.user.id,snapshot:{customerName:invoice.customerName,invoiceNumber:invoice.invoiceNumber,amount:payment.amount,method:payment.method,paidDate:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta'}).format(payment.paidAt),notes:data.notes}}).returning({id:receipts.id});
      await tx.insert(auditLogs).values({actorId:ctx.user.id,actorEmail:ctx.user.email,action:'receipt.create',resource:'finance',resourceId:created.id,message:'Receipt issued for verified payment',metadata:{organizationId:org,paymentId:payment.id}});
      return created.id;
    });
    revalidatePath('/admin/manajemen/kwitansi');
    return {ok:true,message:t('saved'),href:`/admin/manajemen/kwitansi/${id}`};
  }catch{return {ok:false,message:t('failed')};}
}
