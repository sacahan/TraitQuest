import type { Question, FinalResult } from "../types/quest";

type EventCallback<T = unknown> = (data: T) => void;

interface QuestUpdateData {
  narrative?: string;
  questionIndex?: number;
  totalSteps?: number;
  guideMessage?: string;
  question?: Question;
  message?: string;
}

interface QuestError {
  message: string;
  code?: string;
}

interface QuestEvents {
  first_question: QuestUpdateData;
  next_question: QuestUpdateData;
  quest_complete: { message: string };
  final_result: FinalResult;
  error: QuestError;
  guide_message: { message: string };
}

interface QuestWebSocketMessage {
  event: keyof QuestEvents;
  data: QuestEvents[keyof QuestEvents];
}

class QuestWebSocketClient {
  private socket: WebSocket | null = null;
  private callbacks: Map<keyof QuestEvents, EventCallback[]> = new Map();

  private baseUrl: string;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/v1/quests/ws";
  }

  connect(sessionId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}?sessionId=${sessionId}`;
      this.socket = new WebSocket(url, ["Bearer", token]);

      this.socket.onopen = () => {
        resolve();
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data) as QuestWebSocketMessage;
          const { event: eventName, data } = message;
          this.trigger(eventName, data);
        } catch (error) {
          console.error("Failed to parse WS message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        reject(error);
      };

      this.socket.onclose = () => {};
    });
  }

  on<K extends keyof QuestEvents>(
    event: K,
    callback: EventCallback<QuestEvents[K]>,
  ) {
    const handlers = this.callbacks.get(event) || [];
    handlers.push(callback as EventCallback);
    this.callbacks.set(event, handlers);
  }

  private trigger<K extends keyof QuestEvents>(event: K, data: QuestEvents[K]) {
    const handlers = this.callbacks.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  send(event: string, data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      console.error("WebSocket is not open");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const questWsClient = new QuestWebSocketClient();
