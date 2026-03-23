import { ProfileCard } from '../components/profile/ProfileCard'
import { ContributionChart } from '../components/profile/ContributionChart'
import { ChatPanel } from '../components/chat/ChatPanel'

export function ProfilePage() {
  return (
    <main className="layout">
      <aside className="profile-panel">
        <ProfileCard />
        <ContributionChart />
      </aside>
      <section className="chat-panel">
        <ChatPanel />
      </section>
    </main>
  )
}
