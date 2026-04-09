import { CheckCircle, Clock, ChefHat, XCircle, PackageCheck } from "lucide-react"
import type { DbOrder } from "@/types/database"
import type { LucideIcon } from "lucide-react"

export const ACTIVE_STATUSES = ['Pending', 'Preparing', 'Ready'] as const
export const TERMINAL_STATUSES = ['Completed', 'Cancelled'] as const

export type OrderStatus = DbOrder['status']

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "Completed":
      return "bg-gray-50 border-gray-200 text-gray-700"
    case "Preparing":
      return "bg-orange-50 border-orange-200 text-orange-700"
    case "Ready":
      return "bg-green-50 border-green-200 text-green-700"
    case "Cancelled":
      return "bg-gray-100 border-gray-300 text-gray-600"
    case "Pending":
    default:
      return "bg-gray-50 border-gray-200 text-gray-700"
  }
}

export function getStatusIcon(status: OrderStatus): LucideIcon {
  switch (status) {
    case "Completed":
      return CheckCircle
    case "Preparing":
      return ChefHat
    case "Ready":
      return PackageCheck
    case "Cancelled":
      return XCircle
    case "Pending":
    default:
      return Clock
  }
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "Completed":
      return "Completed"
    case "Preparing":
      return "Being Prepared"
    case "Ready":
      return "Ready for Pickup"
    case "Cancelled":
      return "Cancelled"
    case "Pending":
    default:
      return "Pending"
  }
}

// QueueConfirmation uses different labels for Completed and Pending
// because the page is post-placement and emphasizes pickup readiness
export function getQueueStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "Completed":
    case "Ready":
      return "Ready for Pickup"
    case "Cancelled":
      return "Cancelled"
    default:
      return getStatusLabel(status)
  }
}

export function isActive(status: OrderStatus): boolean {
  return (ACTIVE_STATUSES as readonly string[]).includes(status)
}

export function isTerminal(status: OrderStatus): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status)
}

export interface StatusConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}

export function getReceiptStatusConfig(status: OrderStatus): StatusConfig {
  switch (status) {
    case "Preparing":
      return { icon: ChefHat, color: "text-orange-500", bgColor: "bg-orange-50", label: "Being Prepared" }
    case "Ready":
      return { icon: PackageCheck, color: "text-green-600", bgColor: "bg-green-50", label: "Ready for Pickup" }
    case "Completed":
      return { icon: CheckCircle, color: "text-muted-foreground", bgColor: "bg-muted/30", label: "Order Completed" }
    case "Cancelled":
      return { icon: XCircle, color: "text-gray-500", bgColor: "bg-gray-100", label: "Order Cancelled" }
    case "Pending":
    default:
      return { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted/30", label: "Pending" }
  }
}
