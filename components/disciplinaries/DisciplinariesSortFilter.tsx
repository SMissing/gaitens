'use client'

import { Select } from '@/components/ui/select'

type SortOption = 'name' | 'most_disciplinaries' | 'least_disciplinaries' | 'site'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

interface DisciplinariesSortFilterProps {
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filter: FilterOption) => void
  currentSort: SortOption
  currentFilter: FilterOption
}

export function DisciplinariesSortFilter({
  onSortChange,
  onFilterChange,
  currentSort,
  currentFilter,
}: DisciplinariesSortFilterProps) {
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'most_disciplinaries', label: 'Most Disciplinaries' },
    { value: 'least_disciplinaries', label: 'Least Disciplinaries' },
    { value: 'site', label: 'Site' },
  ]

  const filterOptions = [
    { value: 'All', label: 'All Sites' },
    { value: 'Garrison', label: 'Garrison' },
    { value: 'Spirits', label: 'Spirits Bar & Games' },
    { value: 'Bassment', label: 'Bassment' },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* Sort Dropdown */}
      <Select
        value={currentSort}
        onChange={(value) => onSortChange(value as SortOption)}
        options={sortOptions}
        placeholder="Sort by..."
      />

      {/* Filter Dropdown */}
      <Select
        value={currentFilter}
        onChange={(value) => onFilterChange(value as FilterOption)}
        options={filterOptions}
        placeholder="Filter by site..."
      />
    </div>
  )
}
