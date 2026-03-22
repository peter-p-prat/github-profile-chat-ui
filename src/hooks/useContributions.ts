import { useQuery } from '@tanstack/react-query';
import { fetchContributions } from '../api/github';
import { githubKeys } from '../api/github.keys';

export function useContributions() {
  return useQuery({
    queryKey: githubKeys.contributions(),
    queryFn: fetchContributions,
  });
}
