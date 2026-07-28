import { auth, googleProvider, signInWithPopup } from './firebase';
import { GoogleAuthProvider } from 'firebase/auth';

// Add Google Drive File Scope
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedDriveToken: string | null = null;

/**
 * Sign in with Google and request Google Drive permissions
 */
export async function connectGoogleDrive(): Promise<string> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token from Google Sign-In');
    }
    cachedDriveToken = credential.accessToken;
    return cachedDriveToken;
  } catch (err: any) {
    console.error('Google Drive authentication failed:', err);
    throw err;
  }
}

/**
 * Get current Drive access token or request sign-in
 */
export async function getDriveAccessToken(): Promise<string | null> {
  return cachedDriveToken;
}

export function setDriveAccessToken(token: string | null) {
  cachedDriveToken = token;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

/**
 * Upload a text or JSON file to Google Drive
 */
export async function uploadToDrive(
  token: string,
  fileName: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFileItem> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Exported report from PUREATY Premium Food Tiffin Service'
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive Upload Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data as DriveFileItem;
}

/**
 * List files created by PUREATY in Google Drive
 */
export async function listDriveFiles(token: string): Promise<DriveFileItem[]> {
  const queryParam = encodeURIComponent("trashed = false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${queryParam}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink,size)&orderBy=createdTime%20desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive List Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Delete a file from Google Drive (Destructive: caller MUST show user confirmation dialog!)
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<boolean> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok && response.status !== 204) {
    const errText = await response.text();
    throw new Error(`Drive Delete Error (${response.status}): ${errText}`);
  }

  return true;
}
