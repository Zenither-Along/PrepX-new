"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface SectionCompleteCheckboxProps {
  columnId: string;
  isCompleted: boolean;
  onToggle: (columnId: string, isCompleted: boolean) => Promise<void>;
}

export function SectionCompleteCheckbox({
  columnId,
  isCompleted,
  onToggle
}: SectionCompleteCheckboxProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onToggle(columnId, checked);
    } catch (err) {
      console.error('Failed to update section completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mt-6 p-4 border-2 border-dashed border-primary/20 bg-primary/5">
      <div className="flex items-center gap-3">
        <Checkbox
          id={`section-${columnId}`}
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          className="h-5 w-5"
        />
        <label
          htmlFor={`section-${columnId}`}
          className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
        >
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {isCompleted ? "Section completed" : "Mark section as complete"}
        </label>
      </div>
    </Card>
  );
}
