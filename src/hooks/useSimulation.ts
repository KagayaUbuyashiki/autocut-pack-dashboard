import { useState, useEffect, useCallback, useRef } from "react";

export type ProcessStatus = "idle" | "running" | "completed" | "error" | "warning" | "stopped";

export interface ProcessStage {
  id: string;
  name: string;
  status: ProcessStatus;
  progress: number;
  detail: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
}

export interface SimulationState {
  stages: ProcessStage[];
  logs: LogEntry[];
  isRunning: boolean;
  humanDetected: boolean;
  cutDimension: { expected: number; actual: number; valid: boolean } | null;
  cycleCount: number;
}

const STAGES_TEMPLATE: Omit<ProcessStage, "status" | "progress" | "detail">[] = [
  { id: "storage", name: "Retirada do Depósito" },
  { id: "transport", name: "Transporte à Esteira" },
  { id: "loading", name: "Carregamento na Esteira" },
  { id: "inspection1", name: "Verificação de Qualidade" },
  { id: "unwinding", name: "Desbobinamento" },
  { id: "alignment", name: "Alinhamento da Bobina" },
  { id: "inspection2", name: "Verificação Pré-Corte" },
  { id: "cutting", name: "Área de Corte" },
  { id: "laser", name: "Sensor Laser - Medição" },
  { id: "output", name: "Saída / Empacotamento" },
];

const now = () => new Date().toLocaleTimeString("pt-BR");

export function useSimulation() {
  const logId = useRef(0);
  const [state, setState] = useState<SimulationState>({
    stages: STAGES_TEMPLATE.map((s) => ({ ...s, status: "idle", progress: 0, detail: "Aguardando" })),
    logs: [],
    isRunning: false,
    humanDetected: false,
    cutDimension: null,
    cycleCount: 0,
  });

  const addLog = useCallback((message: string, type: LogEntry["type"]) => {
    setState((prev) => ({
      ...prev,
      logs: [{ id: ++logId.current, timestamp: now(), message, type }, ...prev.logs].slice(0, 100),
    }));
  }, []);

  const updateStage = useCallback((id: string, update: Partial<ProcessStage>) => {
    setState((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => (s.id === id ? { ...s, ...update } : s)),
    }));
  }, []);

  const stopOperation = useCallback((reason: string) => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      stages: prev.stages.map((s) =>
        s.status === "running" ? { ...s, status: "stopped", detail: "Parado" } : s
      ),
    }));
    addLog(`⛔ Operação parada: ${reason}`, "error");
  }, [addLog]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      humanDetected: false,
      cutDimension: null,
      stages: STAGES_TEMPLATE.map((s) => ({ ...s, status: "idle", progress: 0, detail: "Aguardando" })),
    }));
    addLog("🚀 Ciclo de produção iniciado", "info");
  }, [addLog]);

  const stop = useCallback(() => {
    stopOperation("Parada manual pelo operador");
  }, [stopOperation]);

  useEffect(() => {
    if (!state.isRunning) return;

    let cancelled = false;
    const stageIds = STAGES_TEMPLATE.map((s) => s.id);

    const runCycle = async () => {
      for (let i = 0; i < stageIds.length; i++) {
        if (cancelled) return;

        const id = stageIds[i];
        const stage = STAGES_TEMPLATE[i];

        updateStage(id, { status: "running", progress: 0, detail: "Em andamento..." });
        addLog(`▶ Iniciando: ${stage.name}`, "info");

        // Simulate progress
        for (let p = 0; p <= 100; p += 20) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 150 + Math.random() * 100));
          if (cancelled) return;
          updateStage(id, { progress: Math.min(p, 100) });
        }

        // Random error chance (~8%)
        if (Math.random() < 0.03 && id !== "storage") {
          updateStage(id, { status: "error", progress: 100, detail: "Falha detectada!" });
          addLog(`❌ Erro na etapa: ${stage.name} - Falha no sensor`, "error");
          setState((prev) => ({ ...prev, isRunning: false }));
          return;
        }

        // Human detection near cutting area
        if (id === "cutting" && Math.random() < 0.12) {
          updateStage(id, { status: "error", progress: 60, detail: "HUMANO DETECTADO!" });
          setState((prev) => ({ ...prev, humanDetected: true, isRunning: false }));
          addLog("🚨 ALERTA: Presença humana detectada na área de corte! Operação interrompida imediatamente!", "error");
          return;
        }

        // Laser measurement after cutting
        if (id === "laser") {
          const expected = 1200; // mm
          const variance = (Math.random() - 0.5) * 40;
          const actual = Math.round(expected + variance);
          const valid = Math.abs(actual - expected) <= 10;
          setState((prev) => ({ ...prev, cutDimension: { expected, actual, valid } }));
          if (!valid) {
            updateStage(id, { status: "warning", progress: 100, detail: `Medida: ${actual}mm (fora do padrão)` });
            addLog(`⚠️ Sensor Laser: peça com ${actual}mm — esperado ${expected}mm (±10mm). Peça rejeitada.`, "warning");
          } else {
            updateStage(id, { status: "completed", progress: 100, detail: `Medida: ${actual}mm ✓` });
            addLog(`✅ Sensor Laser: peça com ${actual}mm — dentro do padrão.`, "success");
          }
          continue;
        }

        updateStage(id, { status: "completed", progress: 100, detail: "Concluído" });
        addLog(`✅ Concluído: ${stage.name}`, "success");
      }

      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          cycleCount: prev.cycleCount + 1,
        }));
        addLog("🔄 Ciclo concluído com sucesso! Reiniciando...", "success");
        // restart cycle
        await new Promise((r) => setTimeout(r, 1000));
        if (!cancelled) {
          setState((prev) => {
            if (!prev.isRunning) return prev;
            return {
              ...prev,
              stages: STAGES_TEMPLATE.map((s) => ({ ...s, status: "idle", progress: 0, detail: "Aguardando" })),
              cutDimension: null,
              humanDetected: false,
            };
          });
        }
      }
    };

    runCycle();

    return () => {
      cancelled = true;
    };
  }, [state.isRunning, state.cycleCount, updateStage, addLog]);

  return { state, start, stop };
}
