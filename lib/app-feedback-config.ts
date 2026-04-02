/** Staff code of the account that can set status and post IT replies on app feedback. */
export const APP_FEEDBACK_IT_STAFF_CODE = '7266'

export function isAppFeedbackITUser(staffCode: string): boolean {
  return staffCode === APP_FEEDBACK_IT_STAFF_CODE
}
