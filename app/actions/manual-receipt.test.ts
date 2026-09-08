import { beforeEach,describe,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({allowed:true,results:[] as unknown[][],insert:vi.fn(),transaction:vi.fn()}));
vi.mock('next-intl/server',()=>({getTranslations:async()=>((key:string)=>key)}));
vi.mock('next/cache',()=>({revalidatePath:vi.fn()}));
vi.mock('@/lib/auth/organization-context',()=>({requireOrganizationContext:async()=>({organizationId:'org',user:{id:'user',email:'test@example.com'}})}));
vi.mock('@/lib/auth/permissions',()=>({hasSessionPermission:()=>mocks.allowed}));
vi.mock('@/db',()=>({db:{transaction:mocks.transaction}}));
import { createManualReceipt } from './manual-receipt';
const id='89c24b54-00b0-46e6-b36c-865b150a182f';
function form(paymentId=id){const f=new FormData();f.set('paymentId',paymentId);f.set('notes','DP');return f;}
describe('manual receipt safety',()=>{
  beforeEach(()=>{
    vi.clearAllMocks();mocks.allowed=true;mocks.results=[];
    mocks.transaction.mockImplementation(async callback=>{
      const tx={select:()=>({from:()=>({where:()=>{const rows=Promise.resolve(mocks.results.shift()??[]);return Object.assign(rows,{for:()=>rows});}})}),insert:mocks.insert};
      return callback(tx);
    });
  });
  it('denies unauthorized writes',async()=>{mocks.allowed=false;expect((await createManualReceipt({ok:false,message:''},form())).ok).toBe(false);expect(mocks.transaction).not.toHaveBeenCalled();});
  it('rejects invalid payment identifiers before querying',async()=>{expect((await createManualReceipt({ok:false,message:''},form('bad'))).ok).toBe(false);expect(mocks.transaction).not.toHaveBeenCalled();});
  it('does not issue receipts for unverified payments',async()=>{mocks.results=[[{id,status:'PENDING'}]];expect((await createManualReceipt({ok:false,message:''},form())).ok).toBe(false);expect(mocks.insert).not.toHaveBeenCalled();});
  it('opens an existing receipt without duplicating money or documents',async()=>{mocks.results=[[{id,status:'VERIFIED'}],[{id:'existing-receipt'}]];const result=await createManualReceipt({ok:false,message:''},form());expect(result.href).toBe('/admin/manajemen/kwitansi/existing-receipt');expect(mocks.insert).not.toHaveBeenCalled();});
  it('issues one receipt and audit event without a new payment',async()=>{
    mocks.results=[[{id,status:'VERIFIED',invoiceId:id,amount:5000000,method:'TRANSFER',paidAt:new Date('2026-09-08T05:00:00Z')}],[],[{id,customerName:'Test',invoiceNumber:'INV-TEST',status:'PARTIAL'}]];
    const values=vi.fn((input:unknown)=>{void input;return {returning:async()=>[{id:'new-receipt'}]};});
    mocks.insert.mockReturnValue({values});
    const result=await createManualReceipt({ok:false,message:''},form());
    expect(result.href).toBe('/admin/manajemen/kwitansi/new-receipt');
    expect(mocks.insert).toHaveBeenCalledTimes(2);
    expect(values.mock.calls[0][0]).toMatchObject({paymentId:id,snapshot:{amount:5000000}});
  });
});
