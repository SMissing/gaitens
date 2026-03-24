/** Post / edit notice pages ↔ DockButtonRow */

export const NOTICES_POST_DOCK_STATE = 'notices-post-dock:state'
export const NOTICES_POST_DOCK_SUBMIT = 'notices-post-dock:submit'
export const NOTICES_POST_DOCK_CANCEL = 'notices-post-dock:cancel'

export type NoticesPostDockStateDetail = {
  saving: boolean
  uploading: boolean
  editing: boolean
}
