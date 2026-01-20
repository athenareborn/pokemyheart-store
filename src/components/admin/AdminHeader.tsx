'use client'

import { Bell, Search, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  sidebarCollapsed: boolean
}

export function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 transition-all duration-300',
        sidebarCollapsed ? 'left-[56px]' : 'left-[240px]'
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search orders, customers..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white h-9"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 h-8">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Quick action</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Create order</DropdownMenuItem>
            <DropdownMenuItem>Add product</DropdownMenuItem>
            <DropdownMenuItem>Add customer</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New order #PMH-008</span>
              <span className="text-xs text-slate-500">Laura C. ordered Deluxe Love bundle</span>
              <span className="text-xs text-slate-400">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Low stock alert</span>
              <span className="text-xs text-slate-500">Only 8 items remaining</span>
              <span className="text-xs text-slate-400">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-slate-500">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 pl-2 pr-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs">
                  AT
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
