export const githubKeys = {
  all: ['github'] as const,
  profile: () => [...githubKeys.all, 'profile'] as const,
  contributions: () => [...githubKeys.all, 'contributions'] as const,
}
