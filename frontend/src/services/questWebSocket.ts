type EventCallback = (data: any) => void;

class QuestWebSocketClient {
  private socket: WebSocket | null = null;
  private callbacks: Map<string, EventCallback[]> = new Map();
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

  on(event: string, callback: EventCallback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  private trigger(event: string, data: any) {
    const eventCallbacks = this.callbacks.get(event);
    if (eventCallbacks) {
      eventCallbacks.forEach(callback => callback(data));
    }
  }

  send(event: string, data: any) {
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
