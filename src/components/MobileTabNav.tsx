import { useState, useRef } from 'react';
import clsx from 'clsx';
import { MessageSquare, User } from 'lucide-react';
import { ProfileCard } from './profile/ProfileCard';
import { ContributionChart } from './profile/ContributionChart';
import { ChatPanel } from './chat/ChatPanel';

type TabValue = 'chat' | 'profile';

export function MobileTabNav() {
  const [activeTab, setActiveTab] = useState<TabValue>('chat');
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab === 'chat') setActiveTab('profile');
    if (isRightSwipe && activeTab === 'profile') setActiveTab('chat');
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden lg:hidden">
      {/* Segmented control */}
      <div className="px-4 py-3 border-b border-border bg-bg/95 backdrop-blur-sm shrink-0">
        <div className="relative flex items-center bg-muted rounded-lg p-1">
          {/* Sliding indicator */}
          <div
            className={clsx(
              'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-bg shadow-sm',
              'transition-transform duration-300 ease-out',
              activeTab === 'chat' ? 'translate-x-0' : 'translate-x-full',
            )}
          />

          {/* Chat tab */}
          <button
            onClick={() => setActiveTab('chat')}
            aria-selected={activeTab === 'chat'}
            role="tab"
            className={clsx(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md',
              'text-sm font-medium transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === 'chat'
                ? 'text-text'
                : 'text-text-muted hover:text-text/80',
            )}
          >
            <MessageSquare className="size-4" />
            <span>Chat</span>
          </button>

          {/* Profile tab */}
          <button
            onClick={() => setActiveTab('profile')}
            aria-selected={activeTab === 'profile'}
            role="tab"
            className={clsx(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md',
              'text-sm font-medium transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === 'profile'
                ? 'text-text'
                : 'text-text-muted hover:text-text/80',
            )}
          >
            <User className="size-4" />
            <span>Profile</span>
          </button>
        </div>

        {/* Swipe hint */}
        <p className="text-[10px] text-text-muted text-center mt-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
          Swipe to switch sections
        </p>
      </div>

      {/* Content area with swipe support */}
      <div
        className="flex-1 overflow-hidden relative touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Chat panel */}
        <div
          className={clsx(
            'absolute inset-0 transition-all duration-300 ease-out',
            activeTab === 'chat'
              ? 'translate-x-0 opacity-100'
              : '-translate-x-full opacity-0 pointer-events-none',
          )}
        >
          <ChatPanel />
        </div>

        {/* Profile panel */}
        <div
          className={clsx(
            'absolute inset-0 transition-all duration-300 ease-out overflow-y-auto scrollbar-thin',
            activeTab === 'profile'
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0 pointer-events-none',
          )}
        >
          <ProfileCard />
          <ContributionChart />
        </div>
      </div>
    </div>
  );
}
