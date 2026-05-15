import { requireAuth } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Building2 } from 'lucide-react'

export default async function BusinessesPage() {
  await requireAuth()

  const hierarchyGroups = [
    {
      title: 'Head Office',
      roles: [
        { title: 'Owners', people: ['Samuel Gaitens', 'Chelsea Gaitens'] },
        { title: 'Operationss Manager', people: ['Kyle Price'] },
        { title: 'Branding Manager', people: ['Nick Henton'] },
      ],
    },
    {
      title: 'Site Management',
      roles: [
        { title: 'Garrison General Manager', people: ['James Harvey'] },
        { title: 'Bassment Assistant Manager', people: ['Matt Douglas'] },
        { title: 'Spirits General Manager', people: ['TBN'] },
        { title: 'Bassment General Manager', people: ['Daisy King'] },
      ],
    },
    {
      title: 'Infrastructure',
      roles: [
        { title: 'Maintanence', people: ['Dan Gaitens'] },
        { title: 'IT', people: ['Sam Missing'] },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Business Information"
        icon={<Building2 className="h-6 w-6 text-spirits-cyan" />}
        description="Learn about our businesses"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/50 p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Hierarchy Roles
            </h2>
            <p className="text-muted-foreground mt-1 mb-5">
              Org structure across the business (Head Office, Site Management, Infrastructure).
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {hierarchyGroups.map((group) => (
                <section
                  key={group.title}
                  className="bg-card/70 backdrop-blur-md rounded-lg border border-border/50 p-4"
                >
                  <h3 className="text-sm font-semibold text-card-foreground mb-3">
                    {group.title}
                  </h3>

                  <div className="space-y-4">
                    {group.roles.map((role) => (
                      <div key={role.title}>
                        <p className="text-xs sm:text-sm font-semibold text-foreground/90 mb-1">
                          {role.title}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {role.people.map((person) => (
                            <li key={person}>{person}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
