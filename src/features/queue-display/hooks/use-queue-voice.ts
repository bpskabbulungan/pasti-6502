import { useEffect, useRef, useState } from "react";
import type { QueueDisplayResponse } from "@shared/types/queue";
import { formatQueueCode } from "../components/queue-display-utils";

type UseQueueVoiceProps = {
  servingQueues: QueueDisplayResponse["servingQueues"];
  enabled?: boolean;
};

export function useQueueVoice({ servingQueues, enabled = false }: UseQueueVoiceProps) {
  // Store a map of queue ID -> updatedAt timestamp
  const prevQueuesRef = useRef<Map<string, number>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // If not enabled, we just sync the ref to avoid playing old queues when enabled
    if (!enabled) {
      prevQueuesRef.current = new Map(servingQueues.map((q) => [q.id, new Date(q.updatedAt).getTime()]));
      return;
    }

    const currentQueuesMap = new Map(servingQueues.map((q) => [q.id, new Date(q.updatedAt).getTime()]));
    
    // Find queues that are either completely new, or have a newer updatedAt timestamp
    const newQueues = servingQueues.filter((q) => {
      const prevTime = prevQueuesRef.current.get(q.id);
      const currentTime = new Date(q.updatedAt).getTime();
      return !prevTime || currentTime > prevTime;
    });

const playChime = async () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Ding (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // Dong (A4)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.4);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.4);
    gain2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.45);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 1.2);

    await new Promise((resolve) => setTimeout(resolve, 1400));
    await ctx.close();
  } catch (err) {
    console.error("Audio chime error:", err);
  }
};

    if (newQueues.length > 0) {
      const playQueue = async () => {
        for (const queue of newQueues) {
          setIsPlaying(true);
          await playChime();

          await new Promise<void>((resolve) => {
            if (!("speechSynthesis" in window)) {
              resolve();
              return;
            }
            
            const code = formatQueueCode(queue.service.name, queue.queueNumber);
            const parts = code.split("-");
            const prefix = parts[0];
            const rawNumber = parts[1] || "";
            const pronouncedNumber = rawNumber
              .split("")
              .map((d) => (d === "0" ? "kosong" : d))
              .join(" ");
            
            const visitorName = queue.visitor?.name ? `, Atas nama, ${queue.visitor.name},` : "";
            const text = `Nomor antrean, ${prefix}, ${pronouncedNumber}${visitorName} silakan menuju ke, ${queue.service.name}`;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "id-ID";
            utterance.rate = 0.85; // Slightly slower for clarity
            
            utterance.onend = () => {
              resolve();
            };
            utterance.onerror = (e) => {
              console.error("Speech synthesis error", e);
              resolve();
            };
            
            window.speechSynthesis.speak(utterance);
          });
        }
        setIsPlaying(false);
      };
      
      void playQueue();
    }

    prevQueuesRef.current = currentQueuesMap;
  }, [servingQueues, enabled]);

  return { isPlaying };
}
