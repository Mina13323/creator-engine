import dns from 'dns';
import nodemailer from 'nodemailer';
import { AdminSettingsModel, ProjectModel, UserModel } from '@creator/database';
import { env } from '../env';

type ContentFlagAlertInput = {
  projectId: string;
  reason?: string;
  flaggedBy?: string;
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP_HOST, SMTP_USER and SMTP_PASS are required to send content flag alerts');
  }

  dns.setDefaultResultOrder('ipv4first');
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    family: 4,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  } as nodemailer.TransportOptions);
}

async function getAdminRecipients(): Promise<string[]> {
  const configuredRecipients = (process.env.CONTENT_FLAG_ALERT_RECIPIENTS || env.WEEKLY_REPORT_RECIPIENTS || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  if (configuredRecipients.length > 0) {
    return Array.from(new Set(configuredRecipients));
  }

  const admins = await UserModel.find({ role: 'admin' }).select('email').lean();
  return Array.from(new Set(admins.map((admin: any) => admin.email).filter(Boolean)));
}

function buildContentFlagHtml(project: any, owner: any, reason: string, flaggedBy?: string): string {
  const flaggedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden">
        <div style="background:#fff1f2;border-bottom:1px solid #fecdd3;padding:20px 24px">
          <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#be123c">Content Flag Alert</div>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;color:#881337">A project was flagged for review</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6">Creator Engine detected or received a content flag that needs admin review.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;color:#64748b;width:150px">Project</td><td style="padding:10px 0;font-weight:700">${escapeHtml(project?.name || project?.id || 'Unknown project')}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Project ID</td><td style="padding:10px 0">${escapeHtml(project?.id)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Creator</td><td style="padding:10px 0">${escapeHtml(owner?.email || project?.userId || 'Unknown creator')}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Reason</td><td style="padding:10px 0;color:#be123c;font-weight:700">${escapeHtml(reason || 'No reason provided')}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Flagged by</td><td style="padding:10px 0">${escapeHtml(flaggedBy || 'Admin action')}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Time</td><td style="padding:10px 0">${escapeHtml(flaggedAt)}</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

export async function sendContentFlagAlert(input: ContentFlagAlertInput): Promise<{ sent: boolean; recipients: string[] }> {
  const settings = await AdminSettingsModel.findOne({ key: 'global_config' }).lean() as any;
  if (settings?.flagAlerts === false) {
    return { sent: false, recipients: [] };
  }

  const project = await ProjectModel.findOne({ id: input.projectId }).lean();
  if (!project) {
    throw new Error('Project not found for content flag alert');
  }

  const recipients = await getAdminRecipients();
  if (recipients.length === 0) {
    throw new Error('No admin recipients found for content flag alerts');
  }

  const owner = await UserModel.findOne({ id: (project as any).userId }).select('email name').lean();
  const reason = input.reason || (project as any).flagReason || 'Content was flagged for admin review';

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || env.SMTP_USER,
    to: recipients.join(', '),
    subject: `Creator Engine - Content Flag: ${(project as any).name || input.projectId}`,
    html: buildContentFlagHtml(project, owner, reason, input.flaggedBy)
  });

  return { sent: true, recipients };
}
