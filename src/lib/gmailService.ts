import { auth, googleProvider, signInWithPopup } from './firebase';
import { GoogleAuthProvider } from 'firebase/auth';

// Add Gmail Scopes
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let cachedGmailToken: string | null = null;

export async function connectGmail(): Promise<string> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token for Gmail');
    }
    cachedGmailToken = credential.accessToken;
    return cachedGmailToken;
  } catch (err: any) {
    console.error('Gmail Auth Error:', err);
    throw err;
  }
}

export function getGmailToken(): string | null {
  return cachedGmailToken;
}

export function setGmailToken(token: string | null) {
  cachedGmailToken = token;
}

/**
 * Encode raw message to base64url format for Gmail API
 */
function encodeRFC822Message(to: string, subject: string, bodyText: string, bodyHtml?: string): string {
  const boundary = "==_PUREATY_EMAIL_BOUNDARY_==";
  let messageParts: string[] = [];

  messageParts.push(`To: ${to}`);
  messageParts.push(`Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`);
  messageParts.push(`MIME-Version: 1.0`);

  if (bodyHtml) {
    messageParts.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    messageParts.push(``);
    messageParts.push(`--${boundary}`);
    messageParts.push(`Content-Type: text/plain; charset=UTF-8`);
    messageParts.push(`Content-Transfer-Encoding: 7bit`);
    messageParts.push(``);
    messageParts.push(bodyText);
    messageParts.push(``);
    messageParts.push(`--${boundary}`);
    messageParts.push(`Content-Type: text/html; charset=UTF-8`);
    messageParts.push(`Content-Transfer-Encoding: 7bit`);
    messageParts.push(``);
    messageParts.push(bodyHtml);
    messageParts.push(``);
    messageParts.push(`--${boundary}--`);
  } else {
    messageParts.push(`Content-Type: text/plain; charset=UTF-8`);
    messageParts.push(``);
    messageParts.push(bodyText);
  }

  const rawString = messageParts.join('\r\n');
  
  // Base64URL encoding
  const base64 = btoa(unescape(encodeURIComponent(rawString)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface SendEmailOptions {
  token: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

/**
 * Send an email using Gmail REST API
 */
export async function sendGmail({ token, to, subject, bodyText, bodyHtml }: SendEmailOptions) {
  const rawBase64 = encodeRFC822Message(to, subject, bodyText, bodyHtml);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawBase64
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API Send Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data; // returns { id, threadId, labelIds }
}

/**
 * Template generators for PUREATY emails
 */
export function buildDispatchEmailHtml(customerName: string, planName: string, address: string, mealTiming: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #30363d;">
      <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #21262d;">
        <h1 style="color: #10b981; font-size: 24px; margin: 0; font-weight: 800;">PUREATY</h1>
        <p style="color: #8b949e; font-size: 12px; margin-top: 4px;">Fresh, Hygienic, Home-Cooked Tiffins</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">🚚 Your Meal is On the Way!</h2>
        <p style="color: #c9d1d9; font-size: 14px; line-height: 1.5;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #c9d1d9; font-size: 14px; line-height: 1.5;">Great news! Your <strong>${mealTiming === 'evening' ? 'Dinner' : 'Lunch'}</strong> tiffin under your <strong>${planName}</strong> has been packed hot in our insulated thermal container and dispatched by our rider.</p>
        
        <div style="background-color: #161b22; padding: 16px; border-radius: 12px; border: 1px solid #30363d; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #8b949e; font-weight: bold;">DELIVERY ADDRESS:</p>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #f0f6fc;">${address}</p>
        </div>

        <p style="color: #c9d1d9; font-size: 13px;">Estimated arrival: <strong>15 - 25 minutes</strong>. Please ensure someone is available to receive the tiffin.</p>
      </div>
      <div style="border-top: 1px solid #21262d; padding-top: 16px; text-align: center; color: #8b949e; font-size: 12px;">
        <p style="margin: 0;">PUREATY Kitchens • Vijay Nagar, Indore</p>
        <p style="margin: 4px 0 0 0;">Need to pause or skip? Manage your subscription anytime in your dashboard.</p>
      </div>
    </div>
  `;
}
