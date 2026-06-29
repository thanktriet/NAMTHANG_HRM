"use client"

import { useState } from "react"
import { MapPin, Wifi, QrCode, ScanFace } from "lucide-react"
import { cn } from "@/lib/utils"

interface Method {
  id: string
  icon: React.ElementType
  name: string
  description: string
  defaultEnabled: boolean
}

const methods: Method[] = [
  { id: "gps", icon: MapPin, name: "Chấm công bằng GPS", description: "Xác định vị trí qua GPS", defaultEnabled: true },
  { id: "wifi", icon: Wifi, name: "Chấm công qua WiFi", description: "Kết nối WiFi công ty", defaultEnabled: true },
  { id: "qr", icon: QrCode, name: "Quét mã QR", description: "Quét mã tại văn phòng", defaultEnabled: false },
  { id: "face", icon: ScanFace, name: "Nhận diện khuôn mặt", description: "Face ID xác thực", defaultEnabled: false },
]

export default function CheckinMethods() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(methods.map((m) => [m.id, m.defaultEnabled]))
  )

  const toggle = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {methods.map((method) => {
        const Icon = method.icon
        const isOn = enabled[method.id]
        return (
          <div
            key={method.id}
            className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isOn ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isOn}
              onClick={() => toggle(method.id)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                isOn ? "bg-primary" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200",
                  isOn ? "translate-x-5 mt-0.5 ml-0.5" : "translate-x-0.5 mt-0.5"
                )}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}
