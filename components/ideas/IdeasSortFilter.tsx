'use client'

import { Select } from '@/components/ui/select'

type SortOption = 'recent' | 'most_liked' | 'most_disliked' | 'oldest'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

interface IdeasSortFilterProps {
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filter: FilterOption) => void
  currentSort: SortOption
  currentFilter: FilterOption
}

export function IdeasSortFilter({
  onSortChange,
  onFilterChange,
  currentSort,
  currentFilter,
}: IdeasSortFilterProps) {
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_disliked', label: 'Most Disliked' },
    { value: 'oldest', label: 'Oldest' },
  ]

  const filterOptions = [
    { value: 'All', label: 'All Venues' },
    { value: 'Garrison', label: 'Garrison' },
    { value: 'Spirits', label: 'Spirits Bar & Games' },
    { value: 'Bassment', label: 'Bassment' },
  ]

  return (
    <div className="flex items-center gap-2">
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
        placeholder="Filter by venue..."
      />
    </div>
  )
}
