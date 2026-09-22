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
  ARCHIVES_KEY,
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
    status: "landed",
    date: "2026-03-01",
  },
  {
    id: "b",
    company: "Kept Co",
    role: "Designer",
    status: "rejectedAfterInterview",
    date: "2026-08-02",
  },
];

const read = (key) => JSON.parse(localStorage.getItem(key));

const renderArchives = () => {
  window.history.pushState({}, "", "/archives");
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(LANGUAGE_KEY, "en");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
});

afterEach(cleanup);

describe("archiving a search", () => {
  it("moves every application into a named archive", async () => {
    renderArchives();

    fireEvent.change(screen.getByLabelText("Archive name"), {
      target: { value: "First job hunt" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Archive$/ }));

    await waitFor(() => expect(read(STORAGE_KEY)).toEqual([]));
    const [archive] = read(ARCHIVES_KEY);
    expect(archive.name).toBe("First job hunt");
    expect(archive.applications.map((item) => item.id).sort()).toEqual([
      "a",
      "b",
    ]);
    expect(screen.getByText("First job hunt")).toBeTruthy();
    expect(screen.getByText("2 applications archived.")).toBeTruthy();
  });

  it("names the archive after its months when left blank", async () => {
    renderArchives();

    fireEvent.click(screen.getByRole("button", { name: /^Archive$/ }));

    await waitFor(() =>
      expect(read(ARCHIVES_KEY)[0].name).toBe("Mar - Aug 2026"),
    );
  });

  it("brings an archive back on unarchive", async () => {
    renderArchives();
    fireEvent.click(screen.getByRole("button", { name: /^Archive$/ }));
    await waitFor(() => expect(read(STORAGE_KEY)).toEqual([]));

    fireEvent.click(screen.getByRole("button", { name: /^Unarchive:/ }));
    expect(read(ARCHIVES_KEY)).toHaveLength(1);
    fireEvent.click(await screen.findByRole("button", { name: "Unarchive" }));

    await waitFor(() => expect(read(STORAGE_KEY)).toHaveLength(2));
    expect(read(ARCHIVES_KEY)).toEqual([]);
    expect(read(DELETED_KEY).map((entry) => entry.id)).toHaveLength(1);
  });

  it("deletes an archive and logs its applications as deleted", async () => {
    renderArchives();
    fireEvent.click(screen.getByRole("button", { name: /^Archive$/ }));
    await waitFor(() => expect(read(ARCHIVES_KEY)).toHaveLength(1));

    fireEvent.click(screen.getByRole("button", { name: /^Delete archive:/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(read(ARCHIVES_KEY)).toEqual([]));
    expect(read(STORAGE_KEY)).toEqual([]);
    const logged = read(DELETED_KEY).map((entry) => entry.id);
    expect(logged).toContain("a");
    expect(logged).toContain("b");
  });

  it("warns that replacing on import deletes the archives too", async () => {
    renderArchives();
    fireEvent.click(screen.getByRole("button", { name: /^Archive$/ }));
    await waitFor(() => expect(read(ARCHIVES_KEY)).toHaveLength(1));

    const input = document.querySelector('input[type="file"]');
    const file = new File([JSON.stringify([stored[0]])], "backup.json", {
      type: "application/json",
    });
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText(
        "You also have 1 archives with 2 applications. Replacing everything deletes them too.",
      ),
    ).toBeTruthy();
  });

  it("reports the archives a merge brings in", async () => {
    localStorage.setItem(STORAGE_KEY, "[]");
    renderArchives();

    const input = document.querySelector('input[type="file"]');
    const backup = {
      applications: [stored[1]],
      archives: [
        {
          id: "arc_old",
          name: "Old search",
          archivedAt: "2021-12-17T11:00:00.000Z",
          applications: [stored[0]],
        },
      ],
    };
    const file = new File([JSON.stringify(backup)], "backup.json", {
      type: "application/json",
    });
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(await screen.findByText("Merge with current"));

    expect(
      await screen.findByText(
        "1 applications added · 0 updated · 1 archives added.",
      ),
    ).toBeTruthy();
    expect(read(ARCHIVES_KEY).map((item) => item.id)).toEqual(["arc_old"]);
  });

  it("cannot archive an empty main page", () => {
    localStorage.setItem(STORAGE_KEY, "[]");
    renderArchives();

    expect(screen.getByRole("button", { name: /^Archive$/ }).disabled).toBe(
      true,
    );
    expect(
      screen.getByText("You haven't archived any search yet."),
    ).toBeTruthy();
  });
});
