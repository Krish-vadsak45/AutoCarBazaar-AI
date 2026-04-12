import { NextRequest } from "next/server";
import Chat from "@/models/message.model";
import connectToDatabase from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ vendorId: string }> },
) {
  const { vendorId } = await props.params;

  let isStreaming = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial ping
      controller.enqueue(`event: ping\ndata: connected\n\n`);

      let changeStream: any = null;

      const stopStreaming = () => {
        isStreaming = false;
        if (changeStream) {
          changeStream.close();
        }
        try {
          controller.close();
        } catch (e) {}
      };

      req.signal.addEventListener("abort", stopStreaming);

      try {
        await connectToDatabase();

        // Use MongoDB Change Streams for real-time updates.
        // This is highly efficient and creates 0 polling load.
        // It requires a MongoDB Replica Set (standard on Mongo Atlas).

        // Find the chat document first to get its _id
        const chat = await Chat.findOne({ vendorId });

        if (chat) {
          // Watch for changes specifically on this chat document
          changeStream = Chat.watch(
            [{ $match: { "documentKey._id": chat._id } }],
            { fullDocument: "updateLookup" },
          );

          changeStream.on("change", (change: any) => {
            if (isStreaming) {
              controller.enqueue(
                `event: update\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`,
              );
            }
          });

          changeStream.on("error", (error: any) => {
            console.error("Change Stream Error:", error);
            stopStreaming();
          });
        }

        // Keep-alive loop to prevent connection timeout
        const interval = setInterval(() => {
          if (isStreaming) {
            controller.enqueue(`event: ping\ndata: alive\n\n`);
          } else {
            clearInterval(interval);
          }
        }, 20000);
      } catch (error) {
        console.error("SSE Setup Error:", error);
        stopStreaming();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
