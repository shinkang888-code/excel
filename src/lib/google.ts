const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export const googleScopes = {
  login: ["openid", "email", "profile"],
  export: [DRIVE_FILE_SCOPE],
};

export function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "",
    exportScopes: googleScopes.export.join(" "),
  };
}
