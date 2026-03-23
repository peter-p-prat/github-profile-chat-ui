import { Github } from 'lucide-react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ContributionChart } from '@/components/profile/ContributionChart';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MobileTabNav } from '@/components/MobileTabNav';

export function ProfilePage() {
  return (
    <div className="flex flex-col h-dvh bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Github className="size-6 text-text" />
          <span className="font-semibold text-text hidden sm:inline">
            Profile Chat
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile layout */}
      <MobileTabNav />

      {/* Desktop layout */}
      <main className="hidden lg:flex flex-1 overflow-hidden">
        <aside className="lg:w-[380px] xl:w-[420px] border-r border-border shrink-0 overflow-y-auto scrollbar-thin">
          <ProfileCard />
          <ContributionChart />
        </aside>
        <section className="flex-1 min-w-0">
          <ChatPanel />
        </section>
      </main>
    </div>
  );
}
