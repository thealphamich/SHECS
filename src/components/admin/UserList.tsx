'use client'

import { useState } from 'react'
import {
    Search, User, Mail, Shield, Trash2, Loader2, MoreVertical,
    CheckCircle2, AlertCircle, Plus, X, Lock, RefreshCw, PenSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createUserAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

interface UserProfile {
    id: string
    full_name: string | null
    role: string | null
    created_at: string
    email?: string
}

interface UserListProps {
    initialUsers: UserProfile[]
}

export function UserList({ initialUsers }: UserListProps) {
    const [users, setUsers] = useState(initialUsers)
    const [search, setSearch] = useState('')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase())
    )

    const handleRefresh = () => {
        router.refresh()
        toast.info('Refreshed user list')
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        setIsDeleting(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) throw error

            setUsers(users.filter(u => u.id !== userId))
            toast.success('User profile deleted')
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user')
        } finally {
            setIsDeleting(null)
        }
    }

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsCreating(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await createUserAction(formData) as any

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('User created successfully')
                setIsCreateModalOpen(false)
                router.refresh()
            }
        } catch (error) {
            toast.error('Failed to process request')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search users by name, email or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-foreground"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">


                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex-1 md:flex-none"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create User</span>
                    </button>
                </div>
            </div>

            {/* Modern Table Layout */}
            <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden text-foreground">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="px-8 py-5 text-[11px] font-black text-muted uppercase tracking-widest pl-10">Name</th>
                                <th className="px-8 py-5 text-[11px] font-black text-muted uppercase tracking-widest">Email</th>
                                <th className="px-8 py-5 text-[11px] font-black text-muted uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[11px] font-black text-muted uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-5 text-[11px] font-black text-muted uppercase tracking-widest text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-background/50 transition-colors group border-b border-border/20">
                                    <td className="px-8 py-5 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm shadow-sm ring-4 ring-card">
                                                {user.full_name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="font-bold text-foreground text-sm">{user.full_name || 'Anonymous User'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-medium text-muted">{user.email || 'No email attached'}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-background text-muted'}`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-medium text-muted">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right pr-10">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-muted hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                <PenSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={isDeleting === user.id}
                                                className="p-2 text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                {isDeleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 text-muted" />
                        </div>
                        <h3 className="text-foreground font-bold mb-1">No users found</h3>
                        <p className="text-muted text-sm">Try adjusting your search or add a new user.</p>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCreateModalOpen(false)} />

                    {/* Adjusted Modal Size and Styling */}
                    <div className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Create User</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-muted hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted transition-colors" />
                                        <input
                                            name="fullName"
                                            required
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="you@shecs.com"
                                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted transition-colors" />
                                        <input
                                            name="password"
                                            type="text"
                                            required
                                            placeholder="••••••••"
                                            minLength={6}
                                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted transition-colors" />
                                        <select
                                            name="role"
                                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                <span>Create User</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
