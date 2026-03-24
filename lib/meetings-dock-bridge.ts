/** Manager Meetings (`/manager/meetings`) ↔ DockButtonRow */

export const MEETINGS_DOCK_STATE = 'meetings-dock:state'
export const MEETINGS_DOCK_ADD = 'meetings-dock:add'
export const MEETINGS_DOCK_CLOSE_FORM = 'meetings-dock:close-form'
export const MEETINGS_DOCK_SUBMIT_FORM = 'meetings-dock:submit-form'
export const MEETINGS_DOCK_REFRESH = 'meetings-dock:refresh'

export type MeetingsDockStateDetail = {
  formOpen: boolean
  listLoading: boolean
  saving: boolean
  /** When form is open: staff list still loading or other submit guard */
  formBlocking: boolean
}
