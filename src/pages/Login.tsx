import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const messages = [
    "Conectando ao servidor...",
    "Autenticando operador...",
    "Carregando módulos de segurança...",
    "Inicializando sensores da esteira...",
    "Sistema pronto.",
  ];

  useEffect(() => {
    const timers = messages.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 700)
    );
    const redirect = setTimeout(() => navigate("/dashboard"), messages.length * 700 + 600);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AutoCut Pack
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Monitoramento Industrial
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-3 font-mono text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-300 ${
                step > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {step > i && i < messages.length - 1 && (
                <span className="text-primary">✓</span>
              )}
              {step > i && i === messages.length - 1 && (
                <span className="text-primary font-bold">●</span>
              )}
              <span className={i === messages.length - 1 && step > i ? "text-primary font-bold" : "text-muted-foreground"}>
                {msg}
              </span>
            </div>
          ))}
          {step <= messages.length && (
            <div className="flex items-center gap-2 text-muted-foreground pt-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="animate-pulse">Processando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
