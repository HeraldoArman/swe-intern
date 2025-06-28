import { createClient } from "@supabase/supabase-js";

import { CoreMessage, streamText, embed } from "ai";

import { google } from "@ai-sdk/google";

export const runtime = "edge";

// --- Inisialisasi Klien ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Tipe Data untuk Dokumen RAG ---

interface Document {
  content: string;

  metadata: {
    fileName: string;
  };
}

// --- Fungsi Bantuan untuk Mengekstrak Teks ---

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

    const userQuery = extractUserQuery(messages[messages.length - 1]); // 1. Buat embedding untuk query pengguna - FIX: Remove 'models/' prefix

    const embeddingResult = await embed({
      model: google.embedding("text-embedding-004"), // Changed from 'models/text-embedding-004'

      value: userQuery,
    });

    const queryEmbedding = embeddingResult.embedding; // 2. Panggil RPC function di Supabase untuk melakukan vector search

    const { data: documents, error: rpcError } = await supabase.rpc(
      "match_documents",

      {
        query_embedding: queryEmbedding,

        match_threshold: 0.1,

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
    console.log(uniqueSources)
    const result = await streamText({
      model: google("models/gemini-2.0-flash-exp"),
      system: `You are a helpful AI assistant. Answer the user's question in Indonesian based on the provided context. But if the context does not contain enough information, you can answer based on your general knowledge. If the user asks about a specific document, provide the title of that document as the source.


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
    });
  } catch (e: any) {
    console.error("Error in chat API:", e);

    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),

      { status: 500 }
    );
  }
}
