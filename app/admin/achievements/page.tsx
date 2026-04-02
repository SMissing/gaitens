import { redirect } from 'next/navigation'

export default function AdminAchievementsRedirectPage() {
  redirect('/manager/achievements/create')
}
