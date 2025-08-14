"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetMs: number): TimeLeft {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

interface CountdownTimerProps {
  /** Data/hora-alvo no fuso de São Paulo. Ex.: "2025-09-01T00:00:00-03:00" */
  targetISO?: string;
  title?: string;
  subtitle?: string;
}

const CountdownTimer = ({
  targetISO = "2025-09-01T00:00:00-03:00", // 01 de Setembro de 2025 00:00 (America/Sao_Paulo)
  title = "🚀 Pré-Rematrículas 2026",
  subtitle = "Início em 01 de Setembro/25",
}: CountdownTimerProps) => {
  const targetMs = new Date(targetISO).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetMs),
  );

  useEffect(() => {
    // Cálculo imediato e depois a cada 1s
    setTimeLeft(getTimeLeft(targetMs));
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetMs]);

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t-4 border-yellow-400 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          {/* Left Content */}
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-yellow-400">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-lg font-bold lg:text-xl">{title}</h3>
              <p className="text-sm text-red-100 lg:text-base">{subtitle}</p>
            </div>
          </div>

          {/* Countdown */}
          <div
            className="flex items-center space-x-2 lg:space-x-4"
            role="timer"
            aria-live="polite"
            aria-label="Contagem regressiva para o início"
          >
            <div className="min-w-[60px] rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold lg:text-3xl">
                {timeLeft.days.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-red-200 lg:text-sm">DIAS</div>
            </div>
            <div className="text-2xl font-bold text-white">:</div>
            <div className="min-w-[60px] rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold lg:text-3xl">
                {timeLeft.hours.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-red-200 lg:text-sm">HORAS</div>
            </div>
            <div className="text-2xl font-bold text-white">:</div>
            <div className="min-w-[60px] rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold lg:text-3xl">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-red-200 lg:text-sm">MIN</div>
            </div>
            <div className="text-2xl font-bold text-white">:</div>
            <div className="min-w-[60px] rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold lg:text-3xl">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-red-200 lg:text-sm">SEG</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
