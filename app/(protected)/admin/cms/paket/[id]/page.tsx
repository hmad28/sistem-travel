import { WorkflowPage } from '@/components/travel/workflow-page';
export default async function Page({ params }: { params: Promise<{id:string}> }) { const { id } = await params; return <WorkflowPage kind="package" id={id} />; }
