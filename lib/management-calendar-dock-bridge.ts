/** Manager management calendar (`/manager/management-calendar`) ↔ DockButtonRow */

export const MANAGEMENT_CAL_DOCK_STATE = 'management-cal-dock:state'
export const MANAGEMENT_CAL_DOCK_ADD = 'management-cal-dock:add'
export const MANAGEMENT_CAL_DOCK_REFRESH = 'management-cal-dock:refresh'
export const MANAGEMENT_CAL_DOCK_CLOSE_ADD = 'management-cal-dock:close-add'
export const MANAGEMENT_CAL_DOCK_CLOSE_DAY = 'management-cal-dock:close-day'
export const MANAGEMENT_CAL_DOCK_CLOSE_EDIT = 'management-cal-dock:close-edit'

export type ManagementCalDockStateDetail = {
  addModalOpen: boolean
  dayPanelOpen: boolean
  editModalOpen: boolean
  listLoading: boolean
  saving: boolean
}
