import { Resend } from "resend";
import { env } from "#shared/config/env";
import { logger } from "#shared/logger";

const resend = new Resend(env.RESEND_API_KEY);

const brand = {
  primary: "#0F4C5C", // placeholder — swap for your actual brand color
  accent: "#E0A458",
  surface: "#F5F6FB",
  border: "#E3E5F2",
  text: "#1A1A2E",
  muted: "#5C5F77",
  subtle: "#8A8DA3",
};

function buildSignupUrl(rawToken: string) {
  return `${env.CLIENT_ORIGIN}/accept-invite?token=${encodeURIComponent(rawToken)}`;
}

function buildResetUrl(rawToken: string) {
  return `${env.CLIENT_ORIGIN}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

function buildShell({
  heading,
  greeting,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  expiresAt,
}: {
  heading: string;
  greeting: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  expiresAt: Date;
}) {
  return `
    <div style="font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; background-color: ${brand.surface}; padding: 32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">
        <tr>
          <td style="background-color: ${brand.primary}; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <div style="color: #FFFFFF; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85;">
              Hotel Management System
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #FFFFFF; padding: 32px 28px; border-left: 1px solid ${brand.border}; border-right: 1px solid ${brand.border};">
            <div style="color: ${brand.accent}; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;">
              ${greeting}
            </div>
            <h1 style="color: ${brand.text}; font-size: 22px; line-height: 1.3; margin: 0 0 16px; font-weight: 700;">
              ${heading}
            </h1>
            <div style="color: ${brand.text}; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              ${bodyHtml}
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 24px;">
              <tr>
                <td style="background-color: ${brand.primary}; border-radius: 8px;">
                  <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px;">
                    ${ctaLabel}
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: ${brand.muted}; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
              This link expires on <strong style="color: ${brand.text};">${new Date(expiresAt).toUTCString()}</strong>.
            </p>
            <p style="color: ${brand.subtle}; font-size: 12px; line-height: 1.5; margin: 0;">
              If you weren't expecting this email you can safely ignore it.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: ${brand.primary}; padding: 16px 24px; border-radius: 0 0 12px 12px;">
            <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 0;">
              Sent by Hotel Management System
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function dispatch({
  to,
  subject,
  html,
  rawToken,
}: {
  to: string;
  subject: string;
  html: string;
  rawToken: string;
}) {
  // Log before the network call so a stuck send still shows up in logs.
  logger.info(
    { to, subject, tokenPrefix: rawToken.slice(0, 4) },
    "sending email",
  );

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error(
      {
        to,
        subject,
        resendError: { name: error.name, message: error.message },
      },
      "resend returned an error",
    );
    // Thrown (not swallowed) so BullMQ marks the job attempt failed and
    // applies the retry/backoff configured in email.queue.ts.
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }

  logger.info({ to, subject, messageId: data?.id }, "email sent");
  return data;
}

export const email = {
  async sendInvite(data: {
    to: string;
    firstName: string;
    rawToken: string;
    expiresAt: Date;
  }) {
    return dispatch({
      to: data.to,
      subject: "You've been invited to join the team",
      html: buildShell({
        heading: "You've been invited",
        greeting: "You're invited",
        bodyHtml: `<p>Hi ${data.firstName}, you've been invited to join the team. Accept your invite to set your password and get started.</p>`,
        ctaLabel: "Accept invitation",
        ctaUrl: buildSignupUrl(data.rawToken),
        expiresAt: data.expiresAt,
      }),
      rawToken: data.rawToken,
    });
  },

  async sendPasswordReset(data: {
    to: string;
    rawToken: string;
    expiresAt: Date;
  }) {
    return dispatch({
      to: data.to,
      subject: "Reset your password",
      html: buildShell({
        heading: "Reset your password",
        greeting: "Password reset requested",
        bodyHtml: `<p>Click below to reset your password. If you didn't request this, you can ignore this email.</p>`,
        ctaLabel: "Reset password",
        ctaUrl: buildResetUrl(data.rawToken),
        expiresAt: data.expiresAt,
      }),
      rawToken: data.rawToken,
    });
  },
};
