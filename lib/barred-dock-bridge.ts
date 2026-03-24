/** Custom events: Barred List page ↔ DockButtonRow */

export const BARRED_DOCK_STATE = 'barred-dock:state'
export const BARRED_DOCK_ADD = 'barred-dock:add'
export const BARRED_DOCK_REFRESH = 'barred-dock:refresh'
export const BARRED_DOCK_SET_VIEW = 'barred-dock:set-view'
export const BARRED_DOCK_CLOSE_ADD = 'barred-dock:close-add'

export type BarredDockStateDetail = {
  disclaimerAccepted: boolean
  addModalOpen: boolean
  activeView: 'active' | 'past'
  loading: boolean
}
