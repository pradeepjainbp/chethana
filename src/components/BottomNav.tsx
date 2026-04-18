'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wind, Timer, PersonStanding, User } from 'lucide-react';

const tabs = [
  { href: '/',        icon: Home,           label: 'Home'    },
  { href: '/breathe', icon: Wind,           label: 'Breathe' },
  { href: '/track',   icon: Timer,          label: 'Track'   },
  { href: '/yoga',    icon: PersonStanding, label: 'Yoga'    },
  { href: '/profile', icon: User,           label: 'Profile' },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8EFE1] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${active ? 'text-sage' : 'text-ink-soft'}`}>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
