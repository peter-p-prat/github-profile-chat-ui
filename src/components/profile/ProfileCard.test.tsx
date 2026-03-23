import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as hooks from '@/hooks/useGithubProfile';
import type { GithubProfile } from '@/api/github.types';
import { ProfileCard } from './ProfileCard';

const MOCK_PROFILE: GithubProfile = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Building cool stuff.',
  publicRepos: 8,
  followers: 9000,
  following: 9,
  stars: 5,
  company: null,
  location: null,
  pronouns: null,
  createdAt: '2011-01-25T00:00:00Z',
};

describe('ProfileCard', () => {
  it('shows skeletons while loading', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders name and login when data is available', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByText('The Octocat')).toBeInTheDocument();
    expect(screen.getByText('@octocat')).toBeInTheDocument();
  });

  it('renders bio when present', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByText('Building cool stuff.')).toBeInTheDocument();
  });

  it('renders stats: repos, followers, following', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9,000')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('renders avatar with correct src', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: MOCK_PROFILE,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/avatar.png',
    );
  });

  it('renders optional fields when provided', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        ...MOCK_PROFILE,
        company: 'Vercel',
        location: 'SF',
        pronouns: 'he/him',
      },
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByText('Vercel')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.getByText('he/him')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', () => {
    vi.spyOn(hooks, 'useGithubProfile').mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      data: undefined,
    } as ReturnType<typeof hooks.useGithubProfile>);
    render(<ProfileCard />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
