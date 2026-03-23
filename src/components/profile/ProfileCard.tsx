import { Building2, ExternalLink, GitFork, MapPin, Star, Users } from 'lucide-react'
import { useGithubProfile } from '../../hooks/useGithubProfile'
import { Skeleton } from '../ui/Skeleton'

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-text-muted" />
      <span className="font-semibold text-text">{value.toLocaleString()}</span>
      <span className="text-text-muted">{label}</span>
    </div>
  )
}

export function ProfileCard() {
  const { data, isLoading, isError } = useGithubProfile()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 border-b border-border">
        <div className="flex items-start gap-4">
          <Skeleton width={80} height={80} className="rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1 pt-1">
            <Skeleton width={140} height={18} />
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton width="100%" height={20} />
          <Skeleton width="100%" height={20} />
          <Skeleton width="100%" height={20} />
          <Skeleton width="100%" height={20} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-text-muted">
        <p>Failed to load profile. Please try again.</p>
      </div>
    )
  }

  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-border">
        <div className="flex items-start gap-4">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.name}
              width={80}
              height={80}
              loading="lazy"
              className="rounded-full border-2 border-border ring-2 ring-border shrink-0 size-20 object-cover"
            />
          ) : (
            <div className="rounded-full border-2 border-border ring-2 ring-border shrink-0 size-20 flex items-center justify-center bg-surface text-lg font-medium text-text">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-text truncate">{data.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-text-muted text-sm">@{data.login}</span>
              {data.pronouns && (
                <span className="text-xs font-normal px-1.5 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border">
                  {data.pronouns}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {data.bio && (
          <p className="text-sm text-text/90 leading-relaxed">{data.bio}</p>
        )}

        {/* Location & Company */}
        {(data.company || data.location) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
            {data.company && (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                <span>{data.company}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-2 gap-3">
          <StatItem icon={GitFork} label="repos" value={data.publicRepos} />
          <StatItem icon={Users} label="followers" value={data.followers} />
          <StatItem icon={Users} label="following" value={data.following} />
          <StatItem icon={Star} label="stars" value={data.stars} />
        </div>
      </div>

      {/* Footer link */}
      <div className="p-4 border-b border-border">
        <a
          href={`https://github.com/${data.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
        >
          <span>View on GitHub</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
