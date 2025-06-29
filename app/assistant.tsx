"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/assistant-ui/sidebar";
import { useState } from "react";

export const Assistant = () => {
  const [sources, setSources] = useState<{ title: string }[]>([]);

  const runtime = useChatRuntime({
    api: "/api/chat",
    onResponse: (response) => {
      const sourcesHeader = response.headers.get("X-Sources");
      if (sourcesHeader) {
        try {
          const parsedSources = JSON.parse(sourcesHeader);
          setSources(parsedSources);
          console.log("Sources found:", parsedSources);
        } catch (error) {
          console.error("Failed to parse sources:", error);
        }
      }

      if (response.status !== 200) {
        console.error("Response error:", response.statusText);
        alert(
          "An error occurred while processing your request. Please try again."
        );
        throw new Error(response.statusText);
      }
      
    },
    onError: (error) => {
      alert("An error occurred: " + error.message);
      console.error("Error in chat runtime:", error.message);
    },
    
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <SidebarInset>

        <Thread sources={sources} />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
