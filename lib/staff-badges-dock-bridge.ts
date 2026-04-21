/** Manager staff list pages (`/manager/achievements`, `/manager/staff-training`; not `/create`) ↔ DockButtonRow */

export const STAFF_BADGES_DOCK_SET_SORT = 'staff-badges-dock:set-sort'
export const STAFF_BADGES_DOCK_SET_FILTER = 'staff-badges-dock:set-filter'
export const STAFF_BADGES_DOCK_REFRESH = 'staff-badges-dock:refresh'

export type StaffBadgesSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'badges_desc'
  | 'badges_asc'
  | 'role_then_name'

export type StaffBadgesVenueFilter = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

export const STAFF_BADGES_SORT_OPTIONS: { value: StaffBadgesSortOption; label: string }[] = [
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
  { value: 'badges_desc', label: 'Most badges' },
  { value: 'badges_asc', label: 'Fewest badges' },
  { value: 'role_then_name', label: 'Role, then name' },
]

/** Same `value`s as badges sort; labels for Staff training page dock only. */
export const STAFF_TRAINING_SORT_OPTIONS: { value: StaffBadgesSortOption; label: string }[] = [
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
  { value: 'badges_desc', label: 'Most modules completed' },
  { value: 'badges_asc', label: 'Fewest modules completed' },
  { value: 'role_then_name', label: 'Role, then name' },
]

export const STAFF_BADGES_FILTER_OPTIONS: { value: StaffBadgesVenueFilter; label: string }[] = [
  { value: 'All', label: 'All venues' },
  { value: 'Garrison', label: 'Garrison' },
  { value: 'Spirits', label: 'Spirits Bar & Games' },
  { value: 'Bassment', label: 'Bassment' },
]
