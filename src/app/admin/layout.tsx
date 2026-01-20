'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleToggle = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newValue))
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={handleToggle} />
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />

      <main
        className={cn(
          'pt-14 min-h-screen transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        )}
      >
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
