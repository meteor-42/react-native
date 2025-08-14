import { useState, useEffect } from "react";
import { Mail, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export type Player = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function usePlayersCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayersCount = async () => {
      const { count, error } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true });

      if (!error && count !== null) {
        setCount(count);
      }
      setLoading(false);
    };

    fetchPlayersCount();
  }, []);

  return { count, loading };
}

export function PlayersCounter() {
  const { count, loading } = usePlayersCount();

  if (loading) {
    return <div className="text-sm text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center justify-center">
        <div className="flex-1 border-t border-border" />
      </div>
      <div className="text-center space-y-1">
        <p className="flex items-center justify-center gap-2">
          <Users className="h-4 w-4" />
          Зарегистрировано: <span className="font-semibold text-foreground">{count}</span>
        </p>
        <p>Регистрация — в телеграме <span className="font-medium text-primary">@fabiocapello</span></p>
      </div>
    </div>
  );
}

export function LoginForm({
  onSuccess,
}: { onSuccess: (player: Player) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("players")
      .select("id, name, email, role, password")
      .eq("email", email)
      .eq("password", password)
      .limit(1)
      .maybeSingle();

    if (err) {
      setError(err.message);
    } else if (!data) {
      setError("Неверный email или пароль");
    } else {
      onSuccess({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
