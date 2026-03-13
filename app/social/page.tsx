import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { MessageSquare } from 'lucide-react'
import { SocialChat } from '@/components/social/SocialChat'

export default async function SocialPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Fetch initial messages (ordered by newest first, will be sorted client-side for chat)
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      userId,
      content,
      createdAt,
      users:userId (
        id,
        name,
        site
      )
    `)
    .order('createdAt', { ascending: false })
    .limit(50)

  return (
    <div 
      className="bg-background flex flex-col overflow-hidden fixed inset-0 z-50"
      style={{
        height: '100svh', // Small viewport height - adjusts when keyboard appears
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <PageHeader 
        title="Social Feed"
        icon={<MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-spirits-cyan" />}
        description="Connect with your colleagues"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="flex-1 overflow-hidden min-h-0" style={{ marginTop: 0, paddingTop: 0, paddingBottom: '60px' }}>
        <SocialChat 
          initialMessages={(messages || []) as any}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
