import { useMutation } from '@tanstack/react-query';
import { api } from '../axios';

export function usePost<TData = any, TVariables = any>(
  url: string,
  onSuccess?: () => void
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await api.post(url, variables);
      return response.data;
    },
    onSuccess,
  });
}
