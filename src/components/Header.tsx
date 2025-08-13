import { LogOut, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function Header({
  email,
  onSignOut,
}: { email: string; onSignOut: () => void }) {
  const handleSignOut = async () => {
    // Локальная "сессия" и выход из supabase на всякий случай
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Home className="h-5 w-5" />
          <span className="font-semibold">My App</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
