"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <SidebarInset>

          <Thread sources={sources}/>
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
