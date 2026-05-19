import { Resend } from 'resend';

// Lazy initialization — avoids crash at startup if RESEND_API_KEY is not yet set
let _resend = null;
const getResend = () => {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key || key === 're_YOUR_API_KEY_HERE') {
      throw new Error('RESEND_API_KEY is not configured in server/.env');
    }
    _resend = new Resend(key);
  }
  return _resend;
};
const FROM_EMAIL = process.env.RESEND_FROM || 'Clique <onboarding@resend.dev>';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; background: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { padding: 40px 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); padding: 36px 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .otp-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #6ee7b7; border-radius: 16px; padding: 28px; text-align: center; margin: 28px 0; }
    .otp-code { font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #0f766e; font-variant-numeric: tabular-nums; }
    .otp-label { color: #64748b; font-size: 13px; margin-top: 8px; }
    .expires { background: #fef9c3; border-left: 4px solid #facc15; padding: 12px 16px; border-radius: 8px; color: #78350f; font-size: 13px; margin: 16px 0; }
    p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>✦ Clique</h1>
        <p>Safe, verified connections</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© 2025 Clique • This email was sent for account security. Do not share your code.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendRegistrationOtp = async (toEmail, code) => {
  const html = baseTemplate(`
    <div class="badge">✉️ Email Verification</div>
    <p>Hi there! Welcome to <strong>Clique</strong>. Please verify your email address to complete your registration.</p>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="otp-label">Your verification code</div>
    </div>
    <div class="expires">⏱ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</div>
    <p>If you didn't create a Clique account, you can safely ignore this email.</p>
  `);

  try {
    const res = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Verify your email — Clique',
      html,
    });
    console.log("📧 [Resend] Registration OTP response:", res);
    return res;
  } catch (err) {
    console.error("❌ [Resend] Failed to send registration OTP:", err.message);
    return { data: null, error: err };
  }
};

export const sendWorkEmailOtp = async (toEmail, code) => {
  const html = baseTemplate(`
    <div class="badge">💼 Work Verification</div>
    <p>You requested to verify your <strong>work email</strong> on Clique. Use the code below to complete verification and unlock your work badge.</p>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="otp-label">Work email verification code</div>
    </div>
    <div class="expires">⏱ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</div>
    <p>Once verified, your profile will display a verified work badge, helping you stand out on Clique.</p>
  `);

  try {
    const res = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Verify your work email — Clique',
      html,
    });
    console.log("📧 [Resend] Work OTP response:", res);
    return res;
  } catch (err) {
    console.error("❌ [Resend] Failed to send work OTP:", err.message);
    return { data: null, error: err };
  }
};

export const sendCollegeEmailOtp = async (toEmail, code) => {
  const html = baseTemplate(`
    <div class="badge">🎓 Student Verification</div>
    <p>You requested to verify your <strong>student / college email</strong> on Clique. Use the code below to get your student verified badge.</p>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="otp-label">Student email verification code</div>
    </div>
    <div class="expires">⏱ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</div>
    <p>Once verified, your profile will display a verified student badge, helping you connect with fellow students.</p>
  `);

  try {
    const res = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Verify your student email — Clique',
      html,
    });
    console.log("📧 [Resend] College OTP response:", res);
    return res;
  } catch (err) {
    console.error("❌ [Resend] Failed to send college OTP:", err.message);
    return { data: null, error: err };
  }
};

// Generic OTP sender (used for email/OTP verify endpoint — dispatches by purpose)
export const sendOtpByPurpose = async (toEmail, code, purpose) => {
  if (purpose === 'work') return sendWorkEmailOtp(toEmail, code);
  if (purpose === 'college') return sendCollegeEmailOtp(toEmail, code);
  return sendRegistrationOtp(toEmail, code);
};
