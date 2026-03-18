import nodemailer from 'nodemailer'

type SendEmailParams = {
  to: string
  subject: string
  text: string
}

function getEnv(name: string): string | undefined {
  const v = process.env[name]
  if (!v) return undefined
  return v
}

function isMissingRequiredEnv(values: Array<string | undefined>): boolean {
  return values.some((v) => !v)
}

export async function sendSmtpEmail(params: SendEmailParams) {
  const smtpHost = getEnv('SMTP_HOST')
  const smtpPortRaw = getEnv('SMTP_PORT')
  const smtpUser = getEnv('SMTP_USER')
  const smtpPass = getEnv('SMTP_PASS')
  const smtpFrom = getEnv('SMTP_FROM')

  const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : undefined

  if (isMissingRequiredEnv([smtpHost, smtpPortRaw, smtpUser, smtpPass, smtpFrom]) || !smtpPort) {
    // Non-critical: allow app to function even if email isn't configured.
    console.warn('[email] SMTP not configured; skipping email send.')
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  await transporter.sendMail({
    from: smtpFrom,
    to: params.to,
    subject: params.subject,
    text: params.text,
  })
}

export async function sendEmailToChelsea(subject: string, text: string) {
  const to = getEnv('EMAIL_CHELSEA_ADDRESS') || getEnv('CHELSEA_EMAIL')
  if (!to) {
    console.warn('[email] Chelsea email not configured; skipping.')
    return
  }

  try {
    await sendSmtpEmail({ to, subject, text })
  } catch (err) {
    console.error('[email] Failed to send Chelsea email:', err)
  }
}

