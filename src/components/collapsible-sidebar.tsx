'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, LayoutDashboard, Bell, Shield, LogOut, Menu, X, TrendingUp, Settings, Users, Activity } from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface CollapsibleSidebarProps {
    isAdmin: boolean
    userName?: string
}

export function CollapsibleSidebar({ isAdmin, userName }: CollapsibleSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()

    // Different nav items for admin vs regular users
    const navItems = isAdmin ? [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/tracking', icon: Activity, label: 'Utility Tracking' },
        { href: '/admin/users', icon: Users, label: 'User Management' },
        { href: '/admin/insights', icon: TrendingUp, label: 'Insights' },
        { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ] : [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
    ]

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                />
            )}

            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={`
                    fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40
                    transition-all duration-300 ease-in-out shadow-sm
                    ${isExpanded ? 'w-64' : 'w-16'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-200">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 p-3 rounded-xl transition-all
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {isExpanded && (
                                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign Out at Bottom */}
                <div className="border-t border-slate-200 p-3">
                    <form action={logout}>
                        <button className={`flex w-full items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all`}>
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {isExpanded && (
                                <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>
                            )}
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
