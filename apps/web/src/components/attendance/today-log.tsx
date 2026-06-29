import { MapPin, Wifi, QrCode, ScanFace, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  name: string
  initials: string
  avatarColor: string
  time: string
  method: "gps" | "wifi" | "qr" | "face"
  status: "on-time" | "late"
  lateMinutes?: number
}

const methodIcons = {
  gps: MapPin,
  wifi: Wifi,
  qr: QrCode,
  face: ScanFace,
}

const logEntries: LogEntry[] = [
  { id: "1", name: "Nguyễn Văn An", initials: "NA", avatarColor: "bg-blue-500", time: "07:55", method: "gps", status: "on-time" },
  { id: "2", name: "Trần Thị Bình", initials: "TB", avatarColor: "bg-pink-500", time: "08:02", method: "wifi", status: "late", lateMinutes: 2 },
  { id: "3", name: "Lê Hoàng Cường", initials: "LC", avatarColor: "bg-green-500", time: "07:50", method: "qr", status: "on-time" },
  { id: "4", name: "Phạm Minh Đức", initials: "PĐ", avatarColor: "bg-orange-500", time: "08:15", method: "face", status: "late", lateMinutes: 15 },
  { id: "5", name: "Hoàng Thị Em", initials: "HE", avatarColor: "bg-purple-500", time: "07:58", method: "gps", status: "on-time" },
  { id: "6", name: "Võ Thanh Phong", initials: "VP", avatarColor: "bg-teal-500", time: "08:30", method: "wifi", status: "late", lateMinutes: 30 },
]

export default function TodayLog() {
  return (
    <div className="space-y-3">
      {logEntries.map((entry) => {
        const MethodIcon = methodIcons[entry.method]
        return (
          <div key={entry.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white",
                entry.avatarColor
              )}
            >
              {entry.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{entry.time}</span>
                <MethodIcon className="h-3 w-3" />
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                entry.status === "on-time"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {entry.status === "on-time" ? "Đúng giờ" : `Trễ ${entry.lateMinutes} phút`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
