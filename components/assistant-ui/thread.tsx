import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  StopCircle,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ToolFallback } from "./tool-fallback";
import { title } from "process";

interface ThreadProps {
  sources: { title: string }[];
}

export const Thread: FC<ThreadProps> = ({ sources }) => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <ThreadPrimitive.Viewport className="h-full overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4">
            <ThreadWelcome />
            <div className="pt-6">
              <ThreadPrimitive.Messages
                components={{
                  UserMessage: UserMessage,
                  EditComposer: EditComposer,
                  AssistantMessage: AssistantMessage,
                }}
              />
            </div>
            <ThreadPrimitive.If empty={false}>
              <div className="h-4" />
            </ThreadPrimitive.If>
            {sources.length > 0 && (
              <div className="mb-1">
                <SourcesDisplay sources={sources} />
              </div>
            )}
          </div>
        </ThreadPrimitive.Viewport>
      </div>

      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl p-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute bottom-20 right-6 z-10 h-10 w-10 rounded-full bg-background shadow-lg border-border/50 disabled:invisible"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex h-full flex-col items-center justify-center py-12">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="h-10 w-10 text-white" />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-foreground">
          How can I help you today?
        </h1>

        <p className="mb-8 text-center text-muted-foreground max-w-md">
          I'm your AI assistant powered by advanced language models. Ask me
          anything!
        </p>

        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  const suggestions = [
    {
      title: "Pengantar Organisasi Komputer",
      prompt: "Berikan saya materi pengantar organisasi komputer",
    },
    {
      title: "Konsep Vektor",
      prompt: "Jelaskan apa itu vektor",
    },
    {
      title: "Pemrograman Java",
      prompt: "Tolong berikan saya contoh kode sederhana dalam Java",
    },
    {
      title: "Ruang Eigen",
      prompt: "Berikan contoh soal ruang eigen",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {suggestions.map((suggestion, index) => (
        <ThreadPrimitive.Suggestion
          key={index}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-md hover:scale-[1.02]"
          prompt={suggestion.prompt}
          method="replace"
          autoSend
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <h3 className="font-medium text-sm text-foreground mb-1">
              {suggestion.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {suggestion.prompt}
            </p>
          </div>
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="relative">
      <ComposerPrimitive.Root className="relative flex min-h-[60px] w-full items-end rounded-2xl border border-border/50 bg-background shadow-sm transition-all focus-within:border-ring/50 focus-within:shadow-md">
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder="Message AI Assistant..."
          className="flex-1 resize-none border-0 bg-transparent px-4 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 max-h-32"
        />
        <div className="flex items-center gap-2 p-2">
          <ComposerAction />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            variant="default"
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            <SendHorizontalIcon className="h-4 w-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Stop generating"
            variant="outline"
            className="h-10 w-10 rounded-xl"
          >
            <StopCircle className="h-4 w-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group relative mb-6 flex justify-end">
      <div className="flex max-w-[80%] items-start gap-3">
        <UserActionBar />
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-2xl rounded-tr-md bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white shadow-sm">
            <MessagePrimitive.Content />
          </div>
          <BranchPicker className="mr-2" />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton
          tooltip="Edit message"
          variant="ghost"
          className="h-8 w-8"
        >
          <PencilIcon className="h-3 w-3" />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="mb-4 rounded-2xl border border-border bg-background p-4">
      <ComposerPrimitive.Input className="w-full resize-none border-0 bg-transparent text-sm focus:outline-none focus:ring-0" />
      <div className="mt-3 flex justify-end gap-2">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button size="sm">Save & Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group relative mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Bot className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3 shadow-sm">
            <MessagePrimitive.Content
              components={{
                Text: MarkdownText,
                tools: { Fallback: ToolFallback },
              }}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <AssistantActionBar />
            <BranchPicker />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton
          tooltip="Copy message"
          variant="ghost"
          className="h-8 w-8"
        >
          <MessagePrimitive.If copied>
            <CheckIcon className="h-3 w-3" />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon className="h-3 w-3" />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton
          tooltip="Regenerate"
          variant="ghost"
          className="h-8 w-8"
        >
          <RefreshCwIcon className="h-3 w-3" />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton
          tooltip="Previous"
          variant="ghost"
          className="h-6 w-6"
        >
          <ChevronLeftIcon className="h-3 w-3" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>

      <span className="text-xs font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>

      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" variant="ghost" className="h-6 w-6">
          <ChevronRightIcon className="h-3 w-3" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const SourcesDisplay: FC<{ sources: { title: string }[] }> = ({ sources }) => {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Bot className="h-4 w-4" />
        📚 Sumber Materi
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-background p-3 transition-all hover:border-border hover:shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <a
                href={`/materi/${source.title}`}
                download
                className="block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate"
                title={source.title}
              >
                {source.title}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
