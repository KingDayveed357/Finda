import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../axios';

export function useFetch<TData>(
  key: string,
  url: string,
  options?: UseQueryOptions<TData, AxiosError>
) {
  return useQuery<TData, AxiosError>({
    queryKey: [key],
    queryFn: async () => {
      const res = await api.get(url);
      return res.data;
    },
    ...options,
  });
}
