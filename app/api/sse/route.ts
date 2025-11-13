import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse";

/**
 * SSE endpoint for real-time communication
 * GET /api/sse?displayId=xxx (for displays)
 * GET /api/sse (for controller)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const displayId = searchParams.get("displayId");
  const clientId = crypto.randomUUID();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Register this client with the SSE manager
      sseManager.addClient(clientId, controller, displayId || undefined);

      // Send initial connection message
      const connectMessage = `event: connected\ndata: ${JSON.stringify({ clientId, displayId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
        } catch (error) {
          clearInterval(keepAlive);
          sseManager.removeClient(clientId);
        }
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        sseManager.removeClient(clientId);
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
