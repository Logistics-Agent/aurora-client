"use client";

import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  LiveMapFilter,
  LiveMapFilterOption,
  LiveMapFilterState,
} from "../types";

type LiveMapFiltersProps = {
  options: readonly LiveMapFilterOption[];
  selectedFilters: LiveMapFilterState;
  onToggle: (filter: LiveMapFilter, value: string) => void;
  onClear: (filter: LiveMapFilter) => void;
  mobileInline?: boolean;
};

function getTriggerLabel(
  option: LiveMapFilterOption,
  selectedValues: readonly string[],
) {
  if (selectedValues.length === 0) return option.label;
  const selectedLabels = selectedValues.map(
    (value) => option.values.find((item) => item.value === value)?.label ?? value,
  );
  if (selectedValues.length === 1) {
    return `${option.label}: ${selectedLabels[0]}`;
  }
  return `${option.label}: ${selectedValues.length} selected`;
}

function FilterValueList({
  option,
  selectedValues,
  onToggle,
}: {
  option: LiveMapFilterOption;
  selectedValues: readonly string[];
  onToggle: (filter: LiveMapFilter, value: string) => void;
}) {
  return (
    <div className="space-y-1">
      {option.values.map((optionValue) => {
        const checkboxId = `live-map-${option.key}-${optionValue.value.toLowerCase().replaceAll(" ", "-")}`;
        return (
          <label
            key={optionValue.value}
            htmlFor={checkboxId}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
          >
            <Checkbox
              id={checkboxId}
              aria-label={optionValue.label}
              checked={selectedValues.includes(optionValue.value)}
              onCheckedChange={() => onToggle(option.key, optionValue.value)}
            />
            <span>{optionValue.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function LiveMapFilters({
  options,
  selectedFilters,
  onToggle,
  onClear,
  mobileInline = false,
}: LiveMapFiltersProps) {
  const activeFilterCount = Object.values(selectedFilters).filter(
    (values) => values.length > 0,
  ).length;

  return (
    <div aria-label="Shipment filters">
      <span className="sr-only">
        {activeFilterCount} shipment filter groups selected
      </span>
      {!mobileInline && <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={activeFilterCount > 0 ? "default" : "outline"}
              aria-label="Open shipment filters"
              className="gap-1"
            >
              <Filter aria-hidden="true" />
              <span>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </span>
              <ChevronDown aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="max-h-[min(32rem,calc(100dvh-2rem))] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto"
          >
            <PopoverHeader>
              <PopoverTitle>Shipment filters</PopoverTitle>
              <PopoverDescription>
                Select one or more values
              </PopoverDescription>
            </PopoverHeader>
            <div className="space-y-4">
              {options.map((option) => {
                const selectedValues = selectedFilters[
                  option.key
                ] as readonly string[];
                return (
                  <section key={option.key}>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-sm font-medium">{option.label}</h3>
                      {selectedValues.length > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onClear(option.key)}
                          className="h-7 px-2 text-xs"
                        >
                          <X aria-hidden="true" /> Clear
                        </Button>
                      )}
                    </div>
                    <FilterValueList
                      option={option}
                      selectedValues={selectedValues}
                      onToggle={onToggle}
                    />
                  </section>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>}

      <div
        className={cn(
          "flex-wrap items-center gap-1",
          mobileInline ? "flex" : "hidden sm:flex",
        )}
      >
        {options.map((option) => {
          const selectedValues = selectedFilters[option.key] as readonly string[];
          const hasSelection = selectedValues.length > 0;

          return (
            <Popover key={option.key}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={hasSelection ? "default" : "outline"}
                  aria-label={getTriggerLabel(option, selectedValues)}
                  className="max-w-full shrink-0 gap-1"
                >
                  {option.key === "status" && <Filter aria-hidden="true" />}
                  <span className="truncate">
                    {getTriggerLabel(option, selectedValues)}
                  </span>
                  <ChevronDown aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64">
                <PopoverHeader className="flex-row items-start justify-between gap-3">
                  <div>
                    <PopoverTitle>{option.label}</PopoverTitle>
                    <PopoverDescription>
                      Select one or more values
                    </PopoverDescription>
                  </div>
                  {hasSelection && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onClear(option.key)}
                      className="h-7 px-2 text-xs"
                    >
                      <X aria-hidden="true" /> Clear
                    </Button>
                  )}
                </PopoverHeader>
                <FilterValueList
                  option={option}
                  selectedValues={selectedValues}
                  onToggle={onToggle}
                />
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
