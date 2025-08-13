import { useState } from "react";
import { LoginForm, type Player } from "@/components/LoginForm";
import { Header } from "@/components/Header";

function App() {
  const [player, setPlayer] = useState<Player | null>(null);

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
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
            <LoginForm onSuccess={setPlayer} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
