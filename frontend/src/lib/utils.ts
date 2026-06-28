import { type ClassValue, clsx } from "clsx"
import { any } from "zod"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
