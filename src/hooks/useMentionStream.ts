import { useEffect, useRef, useState } from "react";
import { addMentions, type StreamStatus } from "@/lib/live";
import type { Mention } from "@/lib/mentions";

/**
 * The live mention stream (L-02). EventSource reconnects by itself, sending Last-Event-ID, each time
 * the server ends a 25 second stream, so the wall continues without gaps or repeats. Arrivals are
 * batched into one update per animation frame so a burst does not re-render 200 cards per event.
 * While paused, arrivals wait in a buffer.
 */
export function useMentionStream(paused: boolean) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [waiting, setWaiting] = useState(0);
  const pending = useRef<Mention[]>([]);
  const held = useRef<Mention[]>([]);
  const frame = useRef<number | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused && held.current.length) {
      const release = held.current;
      held.current = [];
      setWaiting(0);
      setMentions((list) => addMentions(list, release));
    }
  }, [paused]);

  useEffect(() => {
    const source = new EventSource("/api/stream");
    const flush = () => {
      frame.current = null;
      const batch = pending.current;
      pending.current = [];
      if (pausedRef.current) {
        held.current = held.current.concat(batch);
        setWaiting(held.current.length);
      } else setMentions((list) => addMentions(list, batch));
    };
    source.onopen = () => setStatus("live");
    source.onmessage = (event) => {
      try {
        pending.current.push(JSON.parse(event.data) as Mention);
      } catch {
        return;
      }
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    };
    // The server ends each stream on purpose; the reconnect follows at once.
    source.addEventListener("end", () => setStatus("reconnecting"));
    source.onerror = () =>
      setStatus(
        source.readyState === EventSource.CLOSED ? "closed" : "reconnecting",
      );
    return () => {
      source.close();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return { mentions, status, waiting };
}
