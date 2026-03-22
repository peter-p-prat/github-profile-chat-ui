import { useGithubProfile } from '../../hooks/useGithubProfile';
import { Skeleton } from '../ui/Skeleton';

export function ProfileCard() {
  const { data, isLoading, isError } = useGithubProfile();

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton width={64} height={64} className="rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton width={140} height={16} />
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
        <div className="flex gap-6">
          <Skeleton width={50} height={32} />
          <Skeleton width={50} height={32} />
          <Skeleton width={50} height={32} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-text-muted">
        <p>Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img
          src={data.avatarUrl}
          alt={data.name}
          width={64}
          height={64}
          loading="lazy"
          className="rounded-full border-2 border-border"
        />
        <div>
          <h2 className="font-semibold text-base text-text">{data.name}</h2>
          <p className="text-sm text-text-muted">@{data.login}</p>
        </div>
      </div>

      {data.bio && <p className="text-sm text-text">{data.bio}</p>}

      <div className="flex gap-6 text-sm">
        <Stat label="Repos" value={data.publicRepos} />
        <Stat label="Followers" value={data.followers} />
        <Stat label="Following" value={data.following} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-semibold text-text">{value.toLocaleString()}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
