import { createClient } from "@supabase/supabase-js";

import { CoreMessage, streamText, embed } from "ai";

import { google } from "@ai-sdk/google";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Document {
  content: string;

  metadata: {
    fileName: string;
  };
}

function extractUserQuery(message: CoreMessage): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  return message.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const userQuery = extractUserQuery(messages[messages.length - 1]);

    const embeddingResult = await embed({
      model: google.embedding("text-embedding-004"),

      value: userQuery,
    });

    const queryEmbedding = embeddingResult.embedding;

    const { data: documents, error: rpcError } = await supabase.rpc(
      "match_documents",

      {
        query_embedding: queryEmbedding,

        match_threshold: 0.4,

        match_count: 10,
      }
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);

      throw new Error("Gagal mencari dokumen relevan.");
    }

    const typedDocuments: Document[] = documents || [];

    const context = typedDocuments.map((doc) => doc.content).join("\n---\n");
    // console.log("Context:", context);
    const uniqueSources = Array.from(
      new Map(
        typedDocuments.map((doc) => [doc.metadata.fileName, doc])
      ).values()
    );
    // console.log(uniqueSources);
    const result = await streamText({
      model: google("models/gemini-2.0-flash-exp"),
      system: `You are a helpful AI assistant called "Tutor AI". Answer the user's question in Indonesian based on the provided context. But if the context does not contain enough information, you can answer based on your general knowledge. If the user asks about a specific document, provide the title of that document as the source.


Context:

 ${context}`,

      messages,
    });

    return result.toDataStreamResponse({
      headers: {
        "X-Sources": JSON.stringify(
          uniqueSources.map((doc) => ({ title: doc.metadata.fileName }))
        ),
      },
      getErrorMessage(error) {
        // console.error("Error in response:", error);
        if (
          error instanceof Error &&
          (error.message.toLowerCase().includes("quota") ||
            error.message.toLowerCase().includes("resource_exhausted") ||
            error.message.toLowerCase().includes("api key"))
        ) {
          console.error(
            "[ERROR]: API key error or quota exceeded. Please check your API key and usage limits."
          );
          return "API key error or quota exceeded. Please check your API key and usage limits.";
        }

        return (
          console.error("Error in response:", error),
          "[ERROR]: An error occurred: " +
            (error instanceof Error ? error.message : String(error))
        );
      },
    });
  } catch (e: unknown) {
    let message = "Unknown error";
    if (e instanceof Error) {
      if (
        e.message.toLowerCase().includes("api key") ||
        e.message.toLowerCase().includes("quota") ||
        e.message.toLowerCase().includes("insufficient") ||
        e.message.toLowerCase().includes("unauthorized") ||
        e.message.toLowerCase().includes("permission")
      ) {
        message =
          "API key error or quota exceeded. Please check your API key and usage limits.";
      } else {
        message = e.message;
      }
    } else if (typeof e === "string") {
      message = e;
    }
    // console.error("Error message:", message);

    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(message));
        controller.close();
      },
    });

    return new Response(errorStream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson",
        "X-Error": "true",
      },
    });
  }
}
