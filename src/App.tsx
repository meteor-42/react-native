import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { LoginForm, type Player, PlayersCounter } from "@/components/LoginForm";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {player ? (
        <>
          <Header email={player.email} onSignOut={() => setPlayer(null)} />
          <main className="mx-auto max-w-5xl p-6">
            <h1 className="text-2xl font-semibold">
              Добро пожаловать, {player.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Ваша роль: {player.role}
            </p>
          </main>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-lg shadow-lg p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  ⚽
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Футбольные Прогнозы</h1>
                  <p className="text-sm text-muted-foreground mt-2">Войдите в систему для участия</p>
                </div>
              </div>

              <LoginForm onSuccess={setPlayer} />

              <PlayersCounter />

              {/* Version */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground/60">
                  {import.meta.env.VITE_APP_VERSION || 'v1.0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
