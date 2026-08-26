import { describe, expect, it } from "vitest";
import { LANGUAGES } from "../../src/i18n/context";
import en from "../../src/i18n/en";
import pt from "../../src/i18n/pt";
import {
  STATUS_VALUES,
  VIEW_VALUES,
  WORK_MODE_VALUES,
} from "../../src/utils/constants";

/** Flattens a dictionary into "stats.total" style paths. */
function paths(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "object" && value !== null
      ? paths(value, path)
      : [path];
  });
}

const placeholders = (value) =>
  [...String(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

const read = (dictionary, path) =>
  path.split(".").reduce((node, key) => node?.[key], dictionary);

describe("dictionaries", () => {
  const enPaths = paths(en);
  const ptPaths = paths(pt);

  it("define exactly the same keys", () => {
    expect(ptPaths.filter((path) => !enPaths.includes(path))).toEqual([]);
    expect(enPaths.filter((path) => !ptPaths.includes(path))).toEqual([]);
  });

  it("use the same placeholders in both languages", () => {
    enPaths.forEach((path) => {
      expect(placeholders(read(pt, path)), path).toEqual(
        placeholders(read(en, path)),
      );
    });
  });

  it("never leave a string empty", () => {
    Object.entries(LANGUAGES).forEach(([code, dictionary]) => {
      paths(dictionary).forEach((path) => {
        expect(
          String(read(dictionary, path)).trim(),
          `${code}: ${path}`,
        ).not.toBe("");
      });
    });
  });

  it("label every status, work mode and view", () => {
    Object.values(LANGUAGES).forEach((dictionary) => {
      STATUS_VALUES.forEach((value) =>
        expect(dictionary.status[value]).toBeTruthy(),
      );
      WORK_MODE_VALUES.forEach((value) =>
        expect(dictionary.workMode[value]).toBeTruthy(),
      );
      VIEW_VALUES.forEach((value) =>
        expect(dictionary.applications[`view_${value}`]).toBeTruthy(),
      );
    });
  });
});
