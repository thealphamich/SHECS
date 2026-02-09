'use client'

import { MeterRegistration } from '@/components/dashboard/MeterRegistration'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterMeterPage() {
    const router = useRouter()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Link a Meter</h1>
                    <p className="text-slate-500 font-medium">Add another meter to your dashboard</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <MeterRegistration onSuccess={() => router.push('/dashboard')} />
            </div>
        </div>
    )
}
