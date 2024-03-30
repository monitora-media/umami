import { useApi } from './useApi';

export function useAuthMethods() {
  const { get, useQuery } = useApi();
  return useQuery({
    queryKey: ['authMethods'],
    queryFn: () => get('/auth/methods'),
    enabled: true,
  });
}
