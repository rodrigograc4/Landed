# Roadmap

What Landed could grow into, and roughly in what order. Nothing here is a
promise, and nothing here is required for the app to be useful today.

## Possibilities

### Follow-up date

An optional "chase this on" date on each application, with a visible mark on the
ones whose date has passed, either a badge in the row or a "needs attention"
filter in the toolbar.

This is the difference between a record of what you did and a tool that tells
you what to do next, which is the main reason people open a tracker at all. It
fits the existing code cleanly: the field goes through `normalizeApplication`
like every other, and the overdue highlight is the same kind of date comparison
that already drives the automatic no-response detection.

**Effort:** small. **Value:** the highest on this page.

### Tests for the import flow

`normalizeApplication` and `readBackup` are covered, but the merge and replace
paths in `App.jsx` are not, and those are the only two operations in the app
that can destroy data. Component tests need `environment: jsdom` in the Vitest
config and Testing Library, neither of which is set up yet.

**Effort:** small. **Value:** insurance on the one irreversible action.

### Easy sync

A link that carries your applications inside it, as a replacement for exporting
a file and sending it to yourself. The Backup menu gains an Easy sync entry that
produces a link like `landed.rodrigograc4.com/#d=...`, holding every application
compressed into the URL. Open that link on another device and the app unpacks
it, then shows the import dialog it already has, with merge and replace as the
only two choices, before cleaning the fragment out of the address bar.

The point is that everything after the `#` in a URL never reaches a server. Not
the host, not Vercel, nobody. So this stays as local as the app is today, and
the privacy section of the README stays true word for word, which is not the
case for any cloud based sync.

Real applications compress to about 68 characters each, so a link is short
enough to send through any messaging app even with hundreds of entries.

It transfers rather than syncs: each link is a snapshot you choose to accept,
not a connection that stays live. That is honest, and it is what the export and
import pair already does, only without the file.

**Effort:** medium. **Value:** removes the most tedious part of using Landed on
two devices.

### Duplicate an application

A button in the drawer that opens a new form pre-filled with everything except
the date and the status.

Useful when applying to the same company more than once, or to near-identical
postings found on the same platform. The cheapest item on this list, and also
the easiest to skip if you rarely apply twice to the same place.

**Effort:** tiny.

### Dark mode

The palette already lives in CSS tokens in `src/index.css`, so a second set of
values plus a theme switch in the navbar is most of the work, along with a new
`localStorage` key alongside the existing ones.

The catch is not the tokens. It is every hard-coded colour outside them, the
status badge fills (`bg-orange-200`, `bg-sky-200`, `bg-neutral-300`), the rose
used for destructive actions, and the chart bars. Each needs a dark variant, or
they will look wrong against a dark surface.

**Effort:** half a day, not half an hour.

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

Work happens on branches, and merging one into `main` is what produces a new
version. The number lives in `package.json` and is shown in the footer, so
anyone can tell which build they are looking at and quote it in a bug report.

Semantic versioning, read from the user's side rather than an API's:

- **Patch** (`1.0.1`) for fixes and wording, nothing new to learn.
- **Minor** (`1.1.0`) for a new feature that changes nothing already there.
- **Major** (`2.0.0`) for a change in how the app behaves or in what it stores,
  such as a new backup format version.

GitHub releases stay optional under this: the deployed site is always the latest
version and nobody consumes Landed as a package. A `CHANGELOG.md` earns its
place as soon as the version in the footer starts moving.

## Considered and rejected

- **Cloud sync.** An account, a backend and a privacy policy, which is the
  entire category of thing Landed exists to avoid. Easy sync above covers the
  real need without any of it.
- **A QR code for the sync link.** Measured rather than guessed: a QR code holds
  2953 bytes at most, which works out at roughly 40 to 60 applications. Past
  that it silently stops being an option, and a code that dense is already hard
  for a phone camera to read. The link alone has no such ceiling.
