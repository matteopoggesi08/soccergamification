import { LogOut } from 'lucide-react';
import { signOutAction } from '@/actions/auth.actions';
import { TeamSwitcher } from './team-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
      <TeamSwitcher />
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Esci"
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </header>
  );
}
