import { WorkflowPage } from '@/components/travel/workflow-page';
export default async function Page({searchParams}:{searchParams:Promise<{invoice?:string}>}) { const {invoice}=await searchParams; return <WorkflowPage kind="payment" invoiceId={invoice} />; }
