// 考慮到 WebSocket 傳輸的資料多樣性，使用泛型來讓調用方定義資料型別
type EventCallback<T = unknown> = (data: T) => void; 

class QuestWebSocketClient {
  private socket: WebSocket | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Map<string, EventCallback<any>[]> = new Map();

  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/v1/quests/ws';
  }

  connect(sessionId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}?sessionId=${sessionId}&token=${token}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('🔌 WebSocket Connected');
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { event: eventName, data } = message;
          this.trigger(eventName, data);
        } catch (error) {
          console.error('Failed to parse WS message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket Closed');
      };
    });
  }

  // 允許調用者指定 T，預設為 unknown
  on<T = unknown>(event: string, callback: EventCallback<T>) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.callbacks.get(event)?.push(callback as EventCallback<any>);
  }

  private trigger(event: string, data: unknown) {
    const eventCallbacks = this.callbacks.get(event);
    if (eventCallbacks) {
      // 這裡使用 safe cast 並配合 eslint-disable，因為這是底層 Dispatcher
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eventCallbacks.forEach(callback => callback(data as any));
    }
  }



  send(event: string, data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      console.error('WebSocket is not open');
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

