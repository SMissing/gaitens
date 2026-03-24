/** Custom events between Manage Staff page and DockButtonRow */

export const STAFF_DOCK_ADD_ACCOUNT = 'staff-dock:add-account'
export const STAFF_DOCK_CLOSE_FORM = 'staff-dock:close-form'
export const STAFF_DOCK_STATE = 'staff-dock:state'

export type StaffDockStateDetail = { formOpen: boolean; canAdd: boolean }
