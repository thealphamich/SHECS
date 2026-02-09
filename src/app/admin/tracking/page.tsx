import { getAdminTrackingData } from '@/app/actions/meters'
import { AllAccessDashboard } from '@/components/admin/AllAccessDashboard'

export default async function AdminTrackingPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const data = await getAdminTrackingData()
    const params = await searchParams
    const initialSearch = params.search || ''

    return (
        <div className="space-y-6 md:space-y-8">
            <header className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Utility Tracking
                </h1>
                <p className="text-sm md:text-base text-muted font-medium italic">
                    All-Access Management for Green Hills Academy infrastructure
                </p>
            </header>

            <AllAccessDashboard data={data} initialSearch={initialSearch} />
        </div>
    )
}
