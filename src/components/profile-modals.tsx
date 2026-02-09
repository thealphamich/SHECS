'use client'

import { useState } from 'react'
import { X, User, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { updateProfile, changePassword } from '@/app/actions/auth'
import { toast } from 'sonner'

interface ProfileModalsProps {
    isOpen: boolean
    onClose: () => void
    type: 'profile' | 'password'
    userName?: string
}

export function ProfileModals({ isOpen, onClose, type, userName }: ProfileModalsProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = type === 'profile'
                ? await updateProfile(formData)
                : await changePassword(formData)

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(result?.success || 'Settings updated')
                onClose()
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        {type === 'profile' ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                            {type === 'profile' ? 'Profile Settings' : 'Security Settings'}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Update your account info</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {type === 'profile' ? (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="fullName"
                                    type="text"
                                    defaultValue={userName}
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
