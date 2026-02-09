'use client'

import { Search, Moon, Sun, Bell, ShoppingBag, ChevronDown, LayoutDashboard, User, Lock, LogOut, Laptop } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProfileModals } from './profile-modals'
import { createClient } from '@/lib/supabase/client'

interface TopNavProps {
    userName?: string
    userEmail?: string
}

export function TopNav({ userName, userEmail }: TopNavProps) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()
    const [modalConfig, setModalConfig] = useState<{ open: boolean; type: 'profile' | 'password' }>({
        open: false,
        type: 'profile'
    })
    const menuRef = useRef<HTMLDivElement>(null)
    const themeMenuRef = useRef<HTMLDivElement>(null)
    const [unreadCount, setUnreadCount] = useState(0)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false)

            if (data !== null) return // handle error locally or ignore
            // Actually, count is returned in { count } not data usually if using head:true?
            // Wait, select('*', { count: 'exact', head: true }) returns null data but valid count
            // Let's use count from response
        }

        const getCount = async () => {
            const supabase = createClient()
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false)

            setUnreadCount(count || 0)
        }
        getCount()

        // Subscription for real-time updates
        const supabase = createClient()
        const channel = supabase
            .channel('notifications-count')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                getCount()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/admin/tracking?search=${encodeURIComponent(searchQuery)}`)
            setSearchQuery('')
        }
    }

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
                setIsThemeMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const openModal = (type: 'profile' | 'password') => {
        setModalConfig({ open: true, type })
        setIsMenuOpen(false)
    }

    return (
        <>
            <header className="fixed top-0 right-0 left-0 md:left-16 h-16 bg-card/80 backdrop-blur-xl border-b border-border/60 z-30 px-4 md:px-8">
                <div className="h-full flex items-center justify-between max-w-[1600px] mx-auto">
                    {/* Search Bar - Removed */}
                    <div className="flex-1 max-w-xs md:max-w-md"></div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 md:gap-5">
                        <div className="hidden sm:flex items-center gap-2 md:gap-4">
                            {/* Theme Toggle */}
                            <div className="relative" ref={themeMenuRef}>
                                <button
                                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background transition-all text-muted hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    {mounted && (
                                        resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />
                                    )}
                                </button>

                                {isThemeMenuOpen && (
                                    <div className="absolute right-0 mt-4 w-32 bg-card rounded-2xl shadow-xl border border-border p-2 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200 z-50">
                                        {[
                                            { name: 'Light', icon: Sun, value: 'light' },
                                            { name: 'Dark', icon: Moon, value: 'dark' },
                                            { name: 'System', icon: Laptop, value: 'system' }
                                        ].map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => {
                                                    setTheme(t.value)
                                                    setIsThemeMenuOpen(false)
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${theme === t.value
                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'text-muted hover:bg-background hover:text-foreground'
                                                    }`}
                                            >
                                                <t.icon className="w-4 h-4" />
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <Link href="/admin/insights" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-background transition-all text-muted hover:text-blue-600 dark:hover:text-blue-400 relative">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                )}
                            </Link>

                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-3 p-1 rounded-xl hover:bg-background transition-all group"
                            >
                                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-50 dark:ring-slate-800 group-hover:ring-blue-100 dark:group-hover:ring-slate-700 transition-all">
                                    {userName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">{userName || 'User'}</span>
                                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-4 w-72 bg-card rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-border overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300 z-50">
                                    <div className="px-6 py-6 border-b border-border/30 bg-background/50">
                                        <p className="text-lg font-extrabold text-foreground leading-none mb-1">{userName || 'User'}</p>
                                        <p className="text-xs text-muted truncate font-semibold tracking-tight">{userEmail || 'thealphamich@gmail.com'}</p>
                                    </div>
                                    <div className="p-3">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm text-foreground/70 hover:bg-background hover:text-foreground transition-all font-bold group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-card group-hover:shadow-sm transition-all text-muted group-hover:text-blue-600">
                                                <LayoutDashboard className="w-4.5 h-4.5" />
                                            </div>
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => openModal('profile')}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm text-foreground/70 hover:bg-background hover:text-foreground transition-all font-bold group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-card group-hover:shadow-sm transition-all text-muted group-hover:text-blue-600">
                                                <User className="w-4.5 h-4.5" />
                                            </div>
                                            Profile Settings
                                        </button>
                                        <button
                                            onClick={() => openModal('password')}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm text-foreground/70 hover:bg-background hover:text-foreground transition-all font-bold group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:bg-card group-hover:shadow-sm transition-all text-muted group-hover:text-blue-600">
                                                <Lock className="w-4.5 h-4.5" />
                                            </div>
                                            Change Password
                                        </button>
                                    </div>
                                    <div className="px-3 pb-4 pt-2">
                                        <form action={logout}>
                                            <button type="submit" className="flex w-full items-center gap-4 px-6 py-4 rounded-2xl text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all font-extrabold shadow-[0_12px_24px_-8px_rgba(59,130,246,0.6)] active:scale-[0.96] group">
                                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <ProfileModals
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                type={modalConfig.type}
                userName={userName}
            />
        </>
    )
}
