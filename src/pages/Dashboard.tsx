import { useSimulation, ProcessStage, LogEntry } from "@/hooks/useSimulation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Square,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Package,
  Truck,
  Eye,
  Scissors,
  Ruler,
  BoxSelect,
  RotateCcw,
  AlignCenter,
  ScanLine,
  CircleDot,
  UserX,
} from "lucide-react";

const stageIcons: Record<string, React.ReactNode> = {
  storage: <Package className="h-5 w-5" />,
  transport: <Truck className="h-5 w-5" />,
  loading: <BoxSelect className="h-5 w-5" />,
  inspection1: <Eye className="h-5 w-5" />,
  unwinding: <RotateCcw className="h-5 w-5" />,
  alignment: <AlignCenter className="h-5 w-5" />,
  inspection2: <ScanLine className="h-5 w-5" />,
  cutting: <Scissors className="h-5 w-5" />,
  laser: <Ruler className="h-5 w-5" />,
  output: <CircleDot className="h-5 w-5" />,
};

const statusColors: Record<string, string> = {
  idle: "text-muted-foreground border-border",
  running: "text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]",
  completed: "text-[hsl(var(--primary))] border-[hsl(var(--primary))]",
  error: "text-destructive border-destructive",
  warning: "text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]",
  stopped: "text-muted-foreground border-muted-foreground",
};

const progressColors: Record<string, string> = {
  idle: "bg-muted",
  running: "[&>div]:bg-[hsl(210,80%,55%)]",
  completed: "[&>div]:bg-[hsl(var(--primary))]",
  error: "[&>div]:bg-destructive",
  warning: "[&>div]:bg-[hsl(38,92%,50%)]",
  stopped: "[&>div]:bg-muted-foreground",
};

const logTypeColors: Record<string, string> = {
  info: "text-[hsl(210,80%,55%)]",
  warning: "text-[hsl(38,92%,50%)]",
  error: "text-destructive",
  success: "text-[hsl(var(--primary))]",
};

function StageCard({ stage }: { stage: ProcessStage }) {
  return (
    <div
      className={`rounded-lg border-2 p-3 transition-all duration-300 bg-card ${statusColors[stage.status]} ${
        stage.status === "running" ? "shadow-lg shadow-[hsl(210,80%,55%)]/10" : ""
      } ${stage.status === "error" ? "shadow-lg shadow-destructive/20 animate-pulse" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={statusColors[stage.status]}>{stageIcons[stage.id]}</span>
        <span className="text-xs font-semibold truncate">{stage.name}</span>
        {stage.status === "running" && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        {stage.status === "completed" && <CheckCircle2 className="h-3 w-3 ml-auto" />}
        {stage.status === "error" && <XCircle className="h-3 w-3 ml-auto" />}
        {stage.status === "warning" && <AlertTriangle className="h-3 w-3 ml-auto" />}
      </div>
      <Progress value={stage.progress} className={`h-1.5 ${progressColors[stage.status]}`} />
      <p className="text-[10px] mt-1 text-muted-foreground truncate">{stage.detail}</p>
    </div>
  );
}

function LogLine({ log }: { log: LogEntry }) {
  return (
    <div className="flex gap-2 text-xs font-mono py-0.5 border-b border-border/50">
      <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
      <span className={logTypeColors[log.type]}>{log.message}</span>
    </div>
  );
}

export default function Dashboard() {
  const { state, start, stop } = useSimulation();
  const completedStages = state.stages.filter((s) => s.status === "completed").length;
  const errorStages = state.stages.filter((s) => s.status === "error").length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">AutoCut Pack</h1>
            <p className="text-xs text-muted-foreground">Monitoramento da Esteira Industrial — Bobinas de Plástico Bolha</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">Ciclos:</span>
            <span className="text-primary font-bold text-sm">{state.cycleCount}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-bold ${state.isRunning ? "text-primary" : "text-muted-foreground"}`}>
              {state.isRunning ? "● ATIVO" : "○ PARADO"}
            </span>
          </div>
          {!state.isRunning ? (
            <Button onClick={start} size="sm" className="gap-2">
              <Play className="h-4 w-4" /> Iniciar
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" size="sm" className="gap-2">
              <Square className="h-4 w-4" /> Parar
            </Button>
          )}
        </div>
      </header>

      {/* Human detection alert */}
      {state.humanDetected && (
        <div className="mb-4 rounded-lg border-2 border-destructive bg-destructive/10 p-4 flex items-center gap-3 animate-pulse">
          <UserX className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-bold text-destructive text-sm">🚨 ALERTA DE SEGURANÇA</p>
            <p className="text-xs text-destructive/80">
              Presença humana detectada na área de corte. Operação interrompida automaticamente. Verifique a área antes de reiniciar.
            </p>
          </div>
        </div>
      )}

      {/* Laser dimension card */}
      {state.cutDimension && (
        <div
          className={`mb-4 rounded-lg border-2 p-3 flex items-center gap-3 ${
            state.cutDimension.valid
              ? "border-[hsl(var(--primary))] bg-primary/5"
              : "border-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/5"
          }`}
        >
          <Ruler className={`h-6 w-6 ${state.cutDimension.valid ? "text-primary" : "text-[hsl(38,92%,50%)]"}`} />
          <div className="text-xs font-mono">
            <span className="text-muted-foreground">Sensor Laser: </span>
            <span className="font-bold">{state.cutDimension.actual}mm</span>
            <span className="text-muted-foreground"> / esperado: {state.cutDimension.expected}mm</span>
            {state.cutDimension.valid ? (
              <span className="text-primary font-bold ml-2">✓ APROVADO</span>
            ) : (
              <span className="text-[hsl(38,92%,50%)] font-bold ml-2">✗ REJEITADO</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Process stages */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Etapas do Processo</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {completedStages}/{state.stages.length} concluídas
                  {errorStages > 0 && <span className="text-destructive ml-2">{errorStages} erro(s)</span>}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {state.stages.map((stage) => (
                  <StageCard key={stage.id} stage={stage} />
                ))}
              </div>

              {/* Visual pipeline */}
              <div className="mt-4 flex items-center gap-1 overflow-x-auto py-2">
                {state.stages.map((stage, i) => (
                  <div key={stage.id} className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full border-2 transition-all ${
                        stage.status === "completed"
                          ? "bg-primary border-primary"
                          : stage.status === "running"
                          ? "bg-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)] animate-pulse"
                          : stage.status === "error"
                          ? "bg-destructive border-destructive"
                          : stage.status === "warning"
                          ? "bg-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]"
                          : "bg-muted border-border"
                      }`}
                    />
                    {i < state.stages.length - 1 && (
                      <div
                        className={`h-0.5 w-6 ${
                          stage.status === "completed" ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Logs de Operação</span>
                <span className="text-[10px] font-mono text-muted-foreground">{state.logs.length} registros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {state.logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">Nenhum log registrado. Inicie a operação.</p>
                ) : (
                  state.logs.map((log) => <LogLine key={log.id} log={log} />)
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
