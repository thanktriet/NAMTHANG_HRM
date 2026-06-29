"use client"

import { cn } from "@/lib/utils"
import { MapPin, Clock, Truck, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface DispatchOrder {
  id: string
  driverName: string
  vehiclePlate: string
  origin: string
  destination: string
  time: string
  cargo: string
  status: "waiting" | "in_transit" | "completed"
}

interface DispatchBoardProps {
  orders: DispatchOrder[]
}

interface DispatchColumnProps {
  title: string
  orders: DispatchOrder[]
  color: string
  icon: React.ReactNode
}

function DispatchCard({ order }: { order: DispatchOrder }) {
  return (
    <div className="bg-background rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{order.driverName}</span>
        <Badge variant="outline" className="text-xs">{order.vehiclePlate}</Badge>
      </div>
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>{order.origin} → {order.destination}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {order.time}
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {order.cargo}
        </span>
      </div>
    </div>
  )
}

function DispatchColumn({ title, orders, color, icon }: DispatchColumnProps) {
  return (
    <div className="flex-1 min-w-[280px] bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg" style={{ borderTop: `3px solid ${color}` }}>
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
          "bg-muted text-muted-foreground"
        )}>
          {orders.length}
        </span>
      </div>
      <div className="p-2 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {orders.map((order) => (
          <DispatchCard key={order.id} order={order} />
        ))}
        {orders.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Không có lệnh điều động</p>
        )}
      </div>
    </div>
  )
}

export function DispatchBoard({ orders }: DispatchBoardProps) {
  const waiting = orders.filter((o) => o.status === "waiting")
  const inTransit = orders.filter((o) => o.status === "in_transit")
  const completed = orders.filter((o) => o.status === "completed")

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DispatchColumn
        title="Chờ xuất phát"
        orders={waiting}
        color="#f59e0b"
        icon={<Clock className="w-4 h-4 text-yellow-500" />}
      />
      <DispatchColumn
        title="Đang vận chuyển"
        orders={inTransit}
        color="#3b82f6"
        icon={<Truck className="w-4 h-4 text-blue-500" />}
      />
      <DispatchColumn
        title="Hoàn thành"
        orders={completed}
        color="#22c55e"
        icon={<Package className="w-4 h-4 text-green-500" />}
      />
    </div>
  )
}
