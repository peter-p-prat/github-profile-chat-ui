import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ProfileCard } from './ProfileCard';
import * as hooks from '../../hooks/useGithubProfile';

const MOCK_PROFILE = {
  login: 'octocat',
  name: 'The Octocat',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Building cool stuff.',
  publicRepos: 8,
  followers: 9000,
  following: 9,
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
