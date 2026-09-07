'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchTraffic } from '@/lib/api/client/traffic';
import { queryKeys } from '@/lib/query/keys';
export function useTraffic(organizationId:string) {
  return useQuery({queryKey:queryKeys.traffic.summary(organizationId),queryFn:({signal})=>fetchTraffic(signal),refetchInterval:30000,refetchIntervalInBackground:false,retry:1,staleTime:15000});
}
