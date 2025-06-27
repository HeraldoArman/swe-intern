import { google } from "@ai-sdk/google"; 
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const result = streamText({

    model: google("models/gemini-1.5-flash-latest"),

    messages,
    system,
    tools: {
      ...frontendTools(tools),
    },
    toolCallStreaming: true,
    onError: console.log,
  });

  return result.toDataStreamResponse();
}