import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../api/github';
import { githubKeys } from '../api/github.keys';

export function useGithubProfile() {
  return useQuery({
    queryKey: githubKeys.profile(),
    queryFn: fetchProfile,
  });
}
