import type { TrafficSnapshot } from '@/lib/travel/traffic-types';
export async function fetchTraffic(signal?:AbortSignal):Promise<TrafficSnapshot> {
  const response=await fetch('/api/administrations/traffic',{cache:'no-store',signal});
  if(!response.ok)throw new Error('Traffic unavailable');
  return (await response.json()).data;
}
