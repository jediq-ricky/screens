/**
 * Server-Sent Events (SSE) management for real-time communication
 * Handles client connections and message broadcasting
 */

export type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  displayId?: string;
};

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  /**
   * Register a new SSE client
   */
  addClient(id: string, controller: ReadableStreamDefaultController, displayId?: string) {
    this.clients.set(id, { id, controller, displayId });
    console.log(`SSE client connected: ${id}${displayId ? ` (display: ${displayId})` : ''}`);
  }

  /**
   * Remove an SSE client
   */
  removeClient(id: string) {
    this.clients.delete(id);
    console.log(`SSE client disconnected: ${id}`);
  }

  /**
   * Send a message to a specific client
   */
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }

  /**
   * Broadcast a message to all clients
   */
  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    for (const [id, client] of this.clients.entries()) {
      try {
        client.controller.enqueue(encoded);
      } catch (error) {
        console.error(`Failed to send to client ${id}:`, error);
        this.removeClient(id);
      }
    }
  }

  /**
   * Send message to all displays
   */
  broadcastToDisplays(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    for (const [id, client] of this.clients.entries()) {
      if (client.displayId) {
        try {
          client.controller.enqueue(encoded);
        } catch (error) {
          console.error(`Failed to send to display ${id}:`, error);
          this.removeClient(id);
        }
      }
    }
  }

  /**
   * Send message to a specific display
   */
  sendToDisplay(displayId: string, event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    for (const [id, client] of this.clients.entries()) {
      if (client.displayId === displayId) {
        try {
          client.controller.enqueue(encoded);
        } catch (error) {
          console.error(`Failed to send to display ${displayId}:`, error);
          this.removeClient(id);
        }
      }
    }
  }

  /**
   * Get count of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get count of connected displays
   */
  getDisplayCount(): number {
    return Array.from(this.clients.values()).filter(c => c.displayId).length;
  }

  /**
   * Get all connected display IDs
   */
  getConnectedDisplayIds(): string[] {
    return Array.from(this.clients.values())
      .filter(c => c.displayId)
      .map(c => c.displayId!);
  }

  /**
   * Remove all clients (used for testing)
   */
  removeAllClients() {
    this.clients.clear();
  }
}

// Singleton instance
export const sseManager = new SSEManager();
