"use client"

import type { ToolCallContentPartComponent } from "@assistant-ui/react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"

export const ToolFallback: ToolCallContentPartComponent = ({ toolName, argsText, result }) => {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          <CheckIcon className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Tool Used: <span className="font-mono text-blue-600 dark:text-blue-400">{toolName}</span>
          </p>
          <p className="text-xs text-muted-foreground">Successfully executed</p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="border-t border-border/50 bg-muted/30">
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Arguments</h4>
              <pre className="text-xs bg-background rounded-lg p-3 border border-border/50 overflow-x-auto">
                {argsText}
              </pre>
            </div>

            {result !== undefined && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Result</h4>
                <pre className="text-xs bg-background rounded-lg p-3 border border-border/50 overflow-x-auto">
                  {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
