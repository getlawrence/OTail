"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  allowCustomValue?: boolean
  className?: string
}

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  allowCustomValue = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const displayValue = React.useMemo(() => {
    const option = options.find((opt) => opt.value === value)
    if (option) {
      return (
        <div className="flex flex-col text-left">
          <span className="font-medium">{option.label}</span>
          <span className="text-sm text-muted-foreground">{option.value}</span>
        </div>
      )
    }
    return value || placeholder
  }, [value, options, placeholder])

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const newValue = currentValue === value ? "" : currentValue
      onChange(newValue)
      setOpen(false)
      setSearchValue("")
    },
    [value, onChange]
  )

  const handleInputChange = React.useCallback(
    (inputValue: string) => {
      setSearchValue(inputValue)
      if (allowCustomValue) {
        onChange(inputValue)
      }
    },
    [allowCustomValue, onChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-[2.5rem]", className)}
        >
          <div className="flex-grow text-left">{displayValue}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <div className="flex flex-col flex-grow">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.value}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}