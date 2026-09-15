// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "../../src/App";
import { I18nProvider } from "../../src/i18n/I18nProvider";
import {
  DELETED_KEY,
  LANGUAGE_KEY,
  STORAGE_KEY,
} from "../../src/utils/constants";

globalThis.__APP_VERSION__ = "test";

const stored = [
  {
    id: "a",
    company: "Stored Co",
    role: "Engineer",
    status: "interviewing",
    date: "2026-09-01",
    updatedAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "b",
    company: "Kept Co",
    role: "Designer",
    status: "interviewing",
    date: "2026-09-02",
  },
];

const backup = [
  {
    id: "a",
    company: "Stored Co",
    role: "Engineer",
    status: "offer",
    date: "2026-09-01",
    updatedAt: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "c",
    company: "New Co",
    role: "Analyst",
    status: "interviewing",
    date: "2026-09-03",
  },
];

const readStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEY));

const importFile = (content) => {
  const input = document.querySelector('input[type="file"]');
  const file = new File([content], "backup.json", {
    type: "application/json",
  });
  fireEvent.change(input, { target: { files: [file] } });
};

const renderApp = () =>
  render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(LANGUAGE_KEY, "en");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
});

afterEach(cleanup);

describe("importing a backup", () => {
  it("merges: adds new entries, updates newer ones, keeps the rest", async () => {
    renderApp();
    importFile(JSON.stringify(backup));

    fireEvent.click(await screen.findByText("Merge with current"));

    await waitFor(() => expect(readStorage()).toHaveLength(3));
    const byId = Object.fromEntries(
      readStorage().map((item) => [item.id, item]),
    );
    expect(byId.a.status).toBe("offer");
    expect(byId.b.company).toBe("Kept Co");
    expect(byId.c.company).toBe("New Co");
    expect(screen.getByText("1 applications added · 1 updated.")).toBeTruthy();
  });

  it("replaces: drops everything that is not in the file", async () => {
    renderApp();
    importFile(JSON.stringify(backup));

    fireEvent.click(await screen.findByText("Replace everything"));

    await waitFor(() =>
      expect(
        readStorage()
          .map((item) => item.id)
          .sort(),
      ).toEqual(["a", "c"]),
    );
  });

  it("changes nothing when cancelled", async () => {
    renderApp();
    importFile(JSON.stringify(backup));

    fireEvent.click(await screen.findByText("Cancel"));

    await waitFor(() =>
      expect(screen.queryByText("Merge with current")).toBeNull(),
    );
    expect(
      readStorage()
        .map((item) => item.id)
        .sort(),
    ).toEqual(["a", "b"]);
  });

  it("does not bring back an application deleted before the merge", async () => {
    localStorage.setItem(
      DELETED_KEY,
      JSON.stringify([{ id: "c", deletedAt: "2026-09-13T10:00:00.000Z" }]),
    );
    renderApp();
    importFile(JSON.stringify(backup));

    fireEvent.click(await screen.findByText("Merge with current"));

    await waitFor(() =>
      expect(readStorage().find((item) => item.id === "a").status).toBe(
        "offer",
      ),
    );
    expect(readStorage().some((item) => item.id === "c")).toBe(false);
  });

  it("never opens the dialog for an invalid file", async () => {
    renderApp();
    importFile("not json");

    await screen.findByText("This is not a valid JSON file.");
    expect(screen.queryByText("Merge with current")).toBeNull();
    expect(readStorage()).toHaveLength(2);
  });
});
