# Roadmap

What Landed could grow into, and roughly in what order. Nothing here is a
promise, and nothing here is required for the app to be useful today.

## Possibilities

### Sync with Google Drive

An optional "Sync with Google" entry in the Backup menu, and nothing that runs on its own. Clicking it signs in with Google if needed, reads a backup file from the app's hidden folder in the user's own Drive (`appDataFolder`), merges it with what is in the browser using the same merge as import, and writes the result back.

No server and no account of ours: the data lives in the user's Drive and only this app can see that folder. Sync stays manual on purpose, which avoids background conflicts, failed uploads and the one-hour Google token expiring mid-session. Apple is left out, since Sign in with Apple needs a paid developer account and gives no storage.

Needs a Google Cloud client id and consent screen.

**Effort:** medium.

## Versioning

In place. The number lives in `package.json`, is injected by Vite as
`__APP_VERSION__`, and shows in the footer and in every backup file.

- **Patch** (`1.0.1`) for fixes and wording, nothing new to learn.
- **Minor** (`1.1.0`) for a new feature that changes nothing already there.
- **Major** (`2.0.0`) for a change in how the app behaves or in what it stores,
  such as a new backup format version.
