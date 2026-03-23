import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getPostLoginPath } from '@/lib/safe-return-url'
import LoginForm from '@/components/forms/LoginForm'
import Image from 'next/image'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string | string[] }
}) {
  const fromRaw = Array.isArray(searchParams.from) ? searchParams.from[0] : searchParams.from

  const user = await getCurrentUser()
  if (user) {
    redirect(getPostLoginPath(fromRaw))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8 sm:space-y-10">
        {/* Logo Section */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[90%] h-auto">
            <Image
              src="/logos/gtnslogo_text.png"
              alt="Gaitens Leisure Group"
              width={800}
              height={300}
              className="w-full h-auto"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full">
          <LoginForm fromQuery={fromRaw} />
        </div>
      </div>
    </div>
  )
}
