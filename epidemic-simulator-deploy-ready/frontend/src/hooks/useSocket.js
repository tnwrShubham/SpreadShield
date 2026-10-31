import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket = null;

export function useSocket(onEvent) {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.DEV ? "http://localhost:5000" : undefined);
    }

    const handler = (event, data) => cbRef.current(event, data);

    const events = [
      "graph-updated",
      "simulation-result",
    ];

    events.forEach((ev) => socket.on(ev, (data) => handler(ev, data)));

    return () => {
      events.forEach((ev) => socket.off(ev));
    };
  }, []);

  return socket;
}
