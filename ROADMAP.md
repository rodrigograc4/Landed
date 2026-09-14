# Roadmap

What Landed could grow into, and roughly in what order. Nothing here is a
promise, and nothing here is required for the app to be useful today.

## Possibilities

### Favourites

A way to mark the applications you care most about.

In `ApplicationDrawer.jsx`, a new "Favourite" field at the end of the form,
below the notes, with an empty grey heart. Clicking it turns the heart red and
sets `favorite: true` on the application. A favourite shows a red heart next to
the link icon in the row and the card, in the same slot as the Landed
briefcase.

The field goes through `normalizeApplication` like every other, defaulting to
`false`, so old backups import unchanged. A "favourites only" filter in the
toolbar is a natural follow-on but not required for the first version.

**Effort:** small.

### Tests for the import flow

`normalizeApplication` and `readBackup` are covered, but the merge and replace
paths in `App.jsx` are not, and those are the only two operations in the app
that can destroy data. Component tests need `environment: jsdom` in the Vitest
config and Testing Library, neither of which is set up yet.

**Effort:** small. **Value:** insurance on the one irreversible action.

### CSV export

A second entry in the Backup menu that writes the applications as columns, ready
for Excel or Sheets.

It complements the JSON export rather than replacing it. JSON is the format the
app can read back without losing anything; CSV is a one-way trip for people who
want to run their own numbers. Most of `exportApplications` is reusable and only
the serialisation changes, but commas, quotes and line breaks inside notes must
be escaped properly, which is exactly where these exports usually break.

**Effort:** small, with one fiddly detail.

## Versioning

In place. The number lives in `package.json`, is injected by Vite as
`__APP_VERSION__`, and shows in the footer and in every backup file.

- **Patch** (`1.0.1`) for fixes and wording, nothing new to learn.
- **Minor** (`1.1.0`) for a new feature that changes nothing already there.
- **Major** (`2.0.0`) for a change in how the app behaves or in what it stores,
  such as a new backup format version.
