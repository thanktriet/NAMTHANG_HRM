"use client"

import { cn } from "@/lib/utils"
import { CandidateCard } from "./candidate-card"

export interface Candidate {
  id: string
  name: string
  position: string
  date: string
  rating: number
  avatar?: string
}

export interface KanbanColumn {
  id: string
  title: string
  candidates: Candidate[]
  color: string
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
}

function ColumnHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-t-lg" style={{ borderTop: `3px solid ${color}` }}>
      <h3 className="font-semibold text-sm">{title}</h3>
      <span className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
        "bg-muted text-muted-foreground"
      )}>
        {count}
      </span>
    </div>
  )
}

export function KanbanBoard({ columns }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-[280px] bg-muted/30 rounded-lg border"
        >
          <ColumnHeader title={column.title} count={column.candidates.length} color={column.color} />
          <div className="p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
            {column.candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
            {column.candidates.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Chưa có ứng viên</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
