/** Module Maker (`/manager/training`) ↔ DockButtonRow */

export const TRAINING_DOCK_STATE = 'training-dock:state'
export const TRAINING_DOCK_ADD = 'training-dock:add'
export const TRAINING_DOCK_CLOSE_FORM = 'training-dock:close-form'
export const TRAINING_DOCK_SUBMIT_FORM = 'training-dock:submit-form'
export const TRAINING_DOCK_REFRESH = 'training-dock:refresh'
export const TRAINING_DOCK_NEXT_STEP = 'training-dock:next-step'
export const TRAINING_DOCK_PREV_STEP = 'training-dock:prev-step'

export type TrainingDockStateDetail = {
  formOpen: boolean
  listLoading: boolean
  saving: boolean
  editing: boolean
  formStep: number
  onLastStep: boolean
  canAdvance: boolean
}
