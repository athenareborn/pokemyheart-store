'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package, badge: 3 },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300',
          collapsed ? 'w-[56px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 border-b border-slate-800 px-3',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sm">PokeMyHeart</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-rose-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-medium w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                target="_blank"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors',
                  collapsed && 'justify-center'
                )}
              >
                <ExternalLink className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>View Store</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                View Store
              </TooltipContent>
            )}
          </Tooltip>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full mt-1 text-slate-400 hover:text-white hover:bg-slate-800/50',
              collapsed && 'px-0'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
