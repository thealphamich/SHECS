'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, LayoutDashboard, Bell, Shield, LogOut, Menu, X, TrendingUp, Settings, Users, Activity } from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface DashboardShellProps {
    isAdmin: boolean
    userName?: string
    children: React.ReactNode
    topNav: React.ReactNode
}

export function DashboardShell({ isAdmin, userName, children, topNav }: DashboardShellProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()

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
        <div className="min-h-screen bg-background">
            {/* Mobile Menu Button - Only visible on small screens */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg text-foreground shadow-sm"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in"
                />
            )}

            {/* Sidebar Shell */}
            <aside
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={`
                    fixed left-0 top-0 h-screen bg-card border-r border-border z-40
                    transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-sm
                    ${isExpanded ? 'w-64' : 'w-20'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col
                `}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-5 border-b border-border/50">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    {/* Brand Name with slide/fade transition */}
                    <div className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        <span className="text-xl font-black text-foreground tracking-tight">SHECS</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-3 space-y-1 mt-4 overflow-y-auto scrollbar-none">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-muted hover:bg-background hover:text-foreground'
                                    }
                                    ${isExpanded ? 'justify-start px-4' : 'justify-center'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

                                <span className={`
                                    text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300
                                    ${isExpanded ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}
                                `}>
                                    {item.label}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {!isExpanded && !isMobileOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}

                    {/* Logout Button - Inline with other nav items */}
                    <form action={logout}>
                        <button className={`
                            flex w-full items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
                            text-muted hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600
                            ${isExpanded ? 'justify-start px-4' : 'justify-center'}
                        `}>
                            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:rotate-12 transition-transform" />

                            <span className={`
                                text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300
                                ${isExpanded ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}
                            `}>
                                Sign Out
                            </span>

                            {/* Tooltip for collapsed state */}
                            {!isExpanded && !isMobileOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Sign Out
                                </div>
                            )}
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Main Content Wrapper - Synchronized Slide */}
            <div
                className={`
                    flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                    ${isExpanded ? 'md:pl-64' : 'md:pl-20'}
                `}
            >
                {/* Inject TopNav */}
                {topNav}

                <main className="flex-1 p-6 md:p-10 pt-24 md:pt-32">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
