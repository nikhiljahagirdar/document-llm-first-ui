"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuthStore } from "@/lib/store"

const workspaces = [
  { label: "Engineering", value: "eng" },
  { label: "Legal", value: "legal" },
  { label: "Human Resources", value: "hr" },
  { label: "Operations", value: "ops" },
]

export function WorkspaceSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("eng")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between h-9 bg-muted/30 border border-border/40 rounded-xl px-3 hover:bg-muted/50 transition-all font-bold text-[12px] uppercase tracking-wider"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
               <Layers className="h-3 w-3" />
            </div>
            {value
              ? workspaces.find((ws) => ws.value === value)?.label
              : "Select Workspace..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 rounded-2xl border-border/40 shadow-2xl bg-popover/90 backdrop-blur-xl">
        <Command>
          <CommandInput placeholder="Search workspace..." className="text-[12px]" />
          <CommandList>
            <CommandEmpty className="text-[10px] p-4 text-center font-bold uppercase opacity-50">No workspace found.</CommandEmpty>
            <CommandGroup heading="Active Silos">
              {workspaces.map((ws) => (
                <CommandItem
                  key={ws.value}
                  value={ws.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="rounded-lg text-[12px] font-semibold py-2.5"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === ws.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {ws.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-1 border-t border-border/40">
               <Button variant="ghost" className="w-full justify-start text-[10px] font-black uppercase tracking-widest h-9 px-3 hover:bg-primary/5 hover:text-primary">
                  <Plus className="h-3 w-3 mr-2" /> Create Workspace
               </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
