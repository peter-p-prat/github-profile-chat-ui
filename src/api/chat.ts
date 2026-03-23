import type { GithubProfile, ContributionData } from './github.types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const suggestedQuestions = [
  'What languages does this developer primarily use?',
  'How active has this developer been recently?',
  'What are the most popular repositories?',
  "What's the contribution pattern like?",
  'When did this account start being active?',
  'What insights can you share about this profile?',
]

export async function simulateResponse(
  question: string,
  profile: GithubProfile,
  contributions: ContributionData,
): Promise<string> {
  const delay = 800 + Math.random() * 800
  await new Promise((resolve) => setTimeout(resolve, delay))

  const days = contributions.weeks.flatMap((w) => w.days)
  const questionLower = question.toLowerCase()

  if (questionLower.includes('language') || questionLower.includes('tech')) {
    return `Based on ${profile.name}'s repositories, TypeScript appears to be the primary language of choice. This aligns with their role as a Senior Frontend Engineer, where TypeScript is commonly used for building robust, type-safe applications. The pinned repositories like "design-system" and "vite-react-ts-scss-boilerplate" confirm this focus on modern frontend technologies.`
  }

  if (questionLower.includes('active') || questionLower.includes('recent')) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const recentDays = days.filter((d) => new Date(d.date) >= cutoff)
    const recentTotal = recentDays.reduce((sum, d) => sum + d.count, 0)
    return `${profile.name} has been quite active recently with ${recentTotal} contributions in the last month. Their contribution graph shows consistent activity, with noticeable spikes during project development phases. The most recent activity includes creating the "github-profile-chat-ui" repository, suggesting ongoing work on new projects.`
  }

  if (
    questionLower.includes('popular') ||
    questionLower.includes('repositories') ||
    questionLower.includes('repo')
  ) {
    return `${profile.name} has ${profile.publicRepos} public repositories with ${profile.stars} total stars. The most notable projects include:\n\n• **design-system** - A comprehensive, production-ready design system built with React 19, TypeScript, and SCSS following atomic design principles\n• **vite-react-ts-scss-boilerplate** - Modern React boilerplate with comprehensive testing and enterprise-grade tooling\n• **tapi-challenge** - A TypeScript project showcasing problem-solving skills`
  }

  if (questionLower.includes('pattern') || questionLower.includes('contribution')) {
    const avgPerWeek = Math.round(contributions.totalContributions / 52)
    const byDay = [0, 0, 0, 0, 0, 0, 0]
    days.forEach((d) => {
      byDay[new Date(d.date).getDay()] += d.count
    })
    const maxCount = Math.max(...byDay)
    const busiestDay = DAY_NAMES[byDay.indexOf(maxCount)]
    return `${profile.name}'s contribution pattern shows ${contributions.totalContributions} contributions over the past year, averaging about ${avgPerWeek} contributions per week. **${busiestDay}** is their busiest day. The activity tends to peak during weekdays, which is typical for professional developers. There are visible periods of increased activity, likely corresponding to project launches or feature development cycles.`
  }

  if (
    questionLower.includes('start') ||
    questionLower.includes('when') ||
    questionLower.includes('join')
  ) {
    const joinDate = new Date(profile.createdAt)
    const years = Math.floor(
      (Date.now() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    )
    return `${profile.name} joined GitHub in ${joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, making them active for about ${years} years. During this time, they've built a solid portfolio of ${profile.publicRepos} repositories and gained ${profile.followers} followers, establishing themselves as a respected member of the developer community.`
  }

  if (
    questionLower.includes('insight') ||
    questionLower.includes('summary') ||
    questionLower.includes('overview')
  ) {
    return `**Profile Insights for ${profile.name}** (@${profile.login})\n\n${profile.bio}\n\n**Key Metrics:**\n• ${profile.publicRepos} repositories\n• ${profile.followers} followers\n• ${contributions.totalContributions} contributions this year\n\n**Observations:**\nThis profile shows a developer focused on frontend engineering with a strong emphasis on code quality and reusability. The creation of design systems and boilerplate projects indicates someone who values consistency and developer experience.`
  }

  // Busiest day fallback
  if (questionLower.includes('busiest') || questionLower.includes('day of the week')) {
    const byDay = [0, 0, 0, 0, 0, 0, 0]
    days.forEach((d) => {
      byDay[new Date(d.date).getDay()] += d.count
    })
    const maxCount = Math.max(...byDay)
    const busiestDay = DAY_NAMES[byDay.indexOf(maxCount)]
    return `**${busiestDay}** is ${profile.name}'s busiest day of the week with ${maxCount} total contributions over the past year.`
  }

  if (questionLower.includes('weekend')) {
    const weekendTotal = days
      .filter((d) => {
        const day = new Date(d.date).getDay()
        return day === 0 || day === 6
      })
      .reduce((sum, d) => sum + d.count, 0)
    const total = days.reduce((sum, d) => sum + d.count, 0)
    const pct = total > 0 ? ((weekendTotal / total) * 100).toFixed(1) : '0'
    const verdict =
      parseFloat(pct) > 20 ? 'They clearly code on weekends!' : 'They mostly stick to weekdays.'
    return `Weekend contributions account for **${pct}%** of all activity (${weekendTotal} total). ${verdict}`
  }

  if (questionLower.includes('streak')) {
    let maxStreak = 0
    let current = 0
    for (const day of days) {
      if (day.count > 0) {
        current++
        maxStreak = Math.max(maxStreak, current)
      } else {
        current = 0
      }
    }
    const comment =
      maxStreak > 30
        ? 'Impressive dedication!'
        : maxStreak > 14
          ? 'A solid two-week run.'
          : 'Short but consistent bursts.'
    return `Their longest streak is **${maxStreak}** consecutive days with at least one contribution. ${comment}`
  }

  // Default response
  const activeDays = days.filter((d) => d.count > 0).length
  return `Based on ${profile.name}'s GitHub profile, I can see they're a ${profile.bio?.split('.')[0]?.toLowerCase() ?? 'developer'}. With ${profile.publicRepos} repositories and ${contributions.totalContributions} contributions this year, they maintain an active presence on GitHub across ${activeDays} active days.\n\nIs there something specific about their profile, repositories, or contribution activity you'd like to know more about?`
}
