"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface CandidateCardProps {
  candidate: {
    id: string
    name: string
    position: string
    date: string
    rating: number
    avatar?: string
  }
}

function getInitials(name: string): string {
  const parts = name.split(" ")
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0]
  }
  return name.slice(0, 2).toUpperCase()
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Link href={`/tuyen-dung/${candidate.id}`}>
      <div className="bg-background rounded-md border p-3 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {getInitials(candidate.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{candidate.name}</p>
            <p className="text-xs text-muted-foreground truncate">{candidate.position}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <span className="text-xs text-muted-foreground">{candidate.date}</span>
          <RatingStars rating={candidate.rating} />
        </div>
      </div>
    </Link>
  )
}
