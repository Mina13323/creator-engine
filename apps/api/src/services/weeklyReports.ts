import nodemailer from 'nodemailer';
import { AdminSettingsModel } from '@creator/database';
import { generateWeeklyReportData, WeeklyReportData } from '../routes/admin';
import { env } from '../env';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_CHECK_INTERVAL_MS = 60 * 60 * 1000;

let schedulerStarted = false;
let schedulerTimer: NodeJS.Timeout | null = null;
let reportRunning = false;

function escapeHtml(value: unknown): string {
  const entities: Record<string, string> = {
    '&': String.fromCharCode(38, 97, 109, 112, 59),
    '<': String.fromCharCode(38, 108, 116, 59),
    '>': String.fromCharCode(38, 103, 116, 59),
    '"': String.fromCharCode(38, 113, 117, 111, 116, 59),
    "'": String.fromCharCode(38, 35, 51, 57, 59)
  };
  return String(value ?? '').replace(/[&<>"']/g, (char) => entities[char]);
}

function getRecipientList(report: WeeklyReportData): string[] {
  const configured = process.env.WEEKLY_REPORT_RECIPIENTS || report.adminEmails;
  return configured
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

function buildWeeklyReportHtml(report: WeeklyReportData): string {
  const successRate = report.totalRuns > 0
    ? Math.round(((report.statusBreakdown.success || 0) / report.totalRuns) * 100)
    : 100;
  const usersHtml = report.users.length > 0
    ? report.users.map((user: any) => `
      <tr>
        <td><strong>${escapeHtml(user.name || 'Unnamed')}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-success'}">${escapeHtml(user.role || 'user')}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="3">No new registrations this week.</td></tr>';
  const featuresHtml = Object.entries(report.featureBreakdown).length > 0
    ? Object.entries(report.featureBreakdown).map(([feature, amount]) => {
        const percentage = report.totalCreditsConsumed > 0 ? Math.round((Math.abs(amount) / report.totalCreditsConsumed) * 100) : 0;
        return `
          <div class="feature-item">
            <div class="feature-header">
              <span class="feature-name">${escapeHtml(feature)}</span>
              <span class="feature-value">${Math.abs(amount)} Credits (${percentage}%)</span>
              <div class="clearfix"></div>
            </div>
            <div class="progress-track"><div class="progress-bar" style="width: ${percentage}%"></div></div>
          </div>`;
      }).join('')
    : '<p style="font-size: 13px; color: #8fa8a2;">No credit usage recorded this week.</p>';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Creator Engine System Report</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #fcfcfc; color: #2e403d; margin: 0; padding: 30px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 132, 101, 0.05); border: 1px solid #e4f3ee; }
    .header { background: linear-gradient(135deg, #2e403d 0%, #008465 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #a3d9cb; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .content { padding: 35px 30px; }
    .grid { display: table; width: 100%; table-layout: fixed; margin-bottom: 25px; }
    .grid-col { display: table-cell; width: 50%; padding: 8px; }
    .card { background: #fbfdfc; border: 1px solid #e4f3ee; border-radius: 16px; padding: 20px 16px; text-align: center; }
    .card-title { font-size: 11px; text-transform: uppercase; color: #8fa8a2; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
    .card-value { font-size: 26px; font-weight: 800; color: #2e403d; }
    .table-container { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table-container th { background: #e4f3ee; color: #008465; font-weight: 800; font-size: 12px; text-align: left; padding: 12px 14px; }
    .table-container td { padding: 14px; border-bottom: 1px solid #e4f3ee; font-size: 13px; color: #2e403d; }
    .section-title { border-left: 4px solid #008465; padding-left: 10px; margin: 35px 0 20px 0; font-size: 13px; font-weight: 800; color: #2e403d; text-transform: uppercase; letter-spacing: 1px; }
    .feature-item { margin-bottom: 18px; }
    .feature-header { font-size: 13px; margin-bottom: 6px; }
    .feature-name { color: #2e403d; font-weight: 600; float: left; }
    .feature-value { color: #008465; font-weight: 700; float: right; }
    .progress-track { background: #e4f3ee; height: 6px; border-radius: 3px; overflow: hidden; width: 100%; }
    .progress-bar { background: #008465; height: 100%; border-radius: 3px; }
    .footer { background: #fbfdfc; padding: 25px; text-align: center; font-size: 11px; color: #8fa8a2; border-top: 1px solid #e4f3ee; }
    .badge { display: inline-block; padding: 5px 10px; font-size: 10px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-success { background-color: #e4f3ee; color: #008465; }
    .badge-admin { background-color: #2e403d; color: #ffffff; }
    .clearfix { clear: both; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Creator Engine</h1><p>System Diagnostics & Analytics Report</p></div>
    <div class="content">
      <div class="grid">
        <div class="grid-col"><div class="card"><div class="card-title">Total Users</div><div class="card-value">${report.totalUsers}</div></div></div>
        <div class="grid-col"><div class="card"><div class="card-title">New Signups</div><div class="card-value" style="color: #008465;">+${report.recentSignups}</div></div></div>
      </div>
      <div class="grid" style="margin-top: -10px;">
        <div class="grid-col"><div class="card"><div class="card-title">Agent Success Rate</div><div class="card-value" style="color: #008465;">${successRate}%</div></div></div>
        <div class="grid-col"><div class="card"><div class="card-title">Credits Spent</div><div class="card-value">${report.totalCreditsConsumed}</div></div></div>
      </div>
      <div class="section-title">Recent User Registrations</div>
      <table class="table-container"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${usersHtml}</tbody></table>
      <div class="section-title">Credit Usage Breakdown</div>
      <div style="margin-top: 15px;">${featuresHtml}</div>
    </div>
    <div class="footer">This is an automated system report. To configure alert settings, visit the System Policies inside your Admin Dashboard.</div>
  </div>
</body>
</html>`;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required to send weekly reports');
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });
}

export async function sendWeeklyReportEmail(): Promise<{ sent: boolean; recipients: string[]; generatedAt: Date }> {
  const report = await generateWeeklyReportData();
  const recipients = getRecipientList(report);
  if (recipients.length === 0) {
    throw new Error('No admin recipients found for weekly reports');
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipients.join(', '),
    subject: 'Creator Engine - Weekly Analytics Report',
    html: buildWeeklyReportHtml(report)
  });

  await AdminSettingsModel.findOneAndUpdate(
    { key: 'global_config' },
    { $set: { lastWeeklyReportSentAt: report.generatedAt } },
    { upsert: true }
  );

  return { sent: true, recipients, generatedAt: report.generatedAt };
}

async function shouldSendWeeklyReport(): Promise<boolean> {
  const settings = await AdminSettingsModel.findOne({ key: 'global_config' }).lean() as any;
  const isEnabled = env.WEEKLY_REPORT_ENABLED || !!settings?.weeklyReports;
  if (!isEnabled) return false;
  if (!settings?.lastWeeklyReportSentAt) return true;
  return Date.now() - new Date(settings.lastWeeklyReportSentAt).getTime() >= WEEK_MS;
}

async function runWeeklyReportCheck() {
  if (reportRunning) return;
  reportRunning = true;
  try {
    if (await shouldSendWeeklyReport()) {
      await sendWeeklyReportEmail();
      console.info('Weekly Gmail report sent successfully');
    }
  } catch (error) {
    console.error('Weekly Gmail report failed:', error);
  } finally {
    reportRunning = false;
  }
}

export function startWeeklyReportScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const intervalMs = Number(process.env.WEEKLY_REPORT_CHECK_INTERVAL_MS || DEFAULT_CHECK_INTERVAL_MS);
  schedulerTimer = setInterval(runWeeklyReportCheck, intervalMs);
  schedulerTimer.unref?.();
  void runWeeklyReportCheck();
}

export function stopWeeklyReportScheduler() {
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerTimer = null;
  schedulerStarted = false;
}
