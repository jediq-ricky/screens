import { describe, it, expect, vi, beforeEach } from "vitest";
import { sseManager } from "@/lib/sse";

describe("SSEManager", () => {
  let mockController: ReadableStreamDefaultController;

  beforeEach(() => {
    // Clear all clients before each test
    sseManager.removeAllClients();

    // Create a mock controller
    mockController = {
      enqueue: vi.fn(),
      close: vi.fn(),
      error: vi.fn(),
    } as any;
  });

  describe("addClient", () => {
    it("should add a client without displayId", () => {
      sseManager.addClient("client-1", mockController);
      expect(sseManager.getClientCount()).toBe(1);
    });

    it("should add a client with displayId", () => {
      sseManager.addClient("client-1", mockController, "display-1");
      expect(sseManager.getClientCount()).toBe(1);
    });

    it("should add multiple clients", () => {
      sseManager.addClient("client-1", mockController);
      sseManager.addClient("client-2", mockController);
      expect(sseManager.getClientCount()).toBe(2);
    });
  });

  describe("removeClient", () => {
    it("should remove an existing client", () => {
      sseManager.addClient("client-1", mockController);
      sseManager.removeClient("client-1");
      expect(sseManager.getClientCount()).toBe(0);
    });

    it("should handle removing non-existent client gracefully", () => {
      sseManager.removeClient("non-existent");
      expect(sseManager.getClientCount()).toBe(0);
    });
  });

  describe("broadcast", () => {
    it("should send message to all connected clients", () => {
      const controller1 = { enqueue: vi.fn() } as any;
      const controller2 = { enqueue: vi.fn() } as any;

      sseManager.addClient("client-1", controller1);
      sseManager.addClient("client-2", controller2);

      sseManager.broadcast("test-event", { message: "hello" });

      expect(controller1.enqueue).toHaveBeenCalled();
      expect(controller2.enqueue).toHaveBeenCalled();

      // Both should receive the same encoded message
      const callArg1 = controller1.enqueue.mock.calls[0][0];
      const callArg2 = controller2.enqueue.mock.calls[0][0];
      expect(callArg1).toEqual(callArg2);

      // Decode and verify message content
      const message = new TextDecoder().decode(callArg1);
      expect(message).toContain('event: test-event');
      expect(message).toContain('data: {"message":"hello"}');
    });

    it("should format SSE message correctly", () => {
      const controller = { enqueue: vi.fn() } as any;
      sseManager.addClient("client-1", controller);

      sseManager.broadcast("test-event", { foo: "bar" });

      const callArg = controller.enqueue.mock.calls[0][0];
      const message = new TextDecoder().decode(callArg);

      expect(message).toContain('event: test-event');
      expect(message).toContain('data: {"foo":"bar"}');
    });

    it("should remove client if enqueue throws error", () => {
      const controller = {
        enqueue: vi.fn(() => {
          throw new Error("Client disconnected");
        }),
      } as any;

      sseManager.addClient("client-1", controller);
      sseManager.broadcast("test-event", { message: "test" });

      expect(sseManager.getClientCount()).toBe(0);
    });
  });

  describe("sendToDisplay", () => {
    it("should send message only to clients with matching displayId", () => {
      const controller1 = { enqueue: vi.fn() } as any;
      const controller2 = { enqueue: vi.fn() } as any;
      const controller3 = { enqueue: vi.fn() } as any;

      sseManager.addClient("client-1", controller1, "display-1");
      sseManager.addClient("client-2", controller2, "display-2");
      sseManager.addClient("client-3", controller3); // No displayId

      sseManager.sendToDisplay("display-1", "control", { command: "play" });

      expect(controller1.enqueue).toHaveBeenCalled();
      expect(controller2.enqueue).not.toHaveBeenCalled();
      expect(controller3.enqueue).not.toHaveBeenCalled();
    });

    it("should handle no matching clients", () => {
      const controller = { enqueue: vi.fn() } as any;
      sseManager.addClient("client-1", controller, "display-1");

      sseManager.sendToDisplay("display-2", "control", { command: "play" });

      expect(controller.enqueue).not.toHaveBeenCalled();
    });
  });

  describe("broadcastToDisplays", () => {
    it("should send message to all display clients", () => {
      const controller1 = { enqueue: vi.fn() } as any;
      const controller2 = { enqueue: vi.fn() } as any;
      const controller3 = { enqueue: vi.fn() } as any;

      sseManager.addClient("client-1", controller1, "display-1");
      sseManager.addClient("client-2", controller2, "display-2");
      sseManager.addClient("client-3", controller3); // Controller (no displayId)

      sseManager.broadcastToDisplays("reload", {});

      expect(controller1.enqueue).toHaveBeenCalled();
      expect(controller2.enqueue).toHaveBeenCalled();
      expect(controller3.enqueue).not.toHaveBeenCalled();
    });
  });

  describe("getClientCount", () => {
    it("should return correct client count", () => {
      expect(sseManager.getClientCount()).toBe(0);

      sseManager.addClient("client-1", mockController);
      expect(sseManager.getClientCount()).toBe(1);

      sseManager.addClient("client-2", mockController);
      expect(sseManager.getClientCount()).toBe(2);

      sseManager.removeClient("client-1");
      expect(sseManager.getClientCount()).toBe(1);
    });
  });
});
