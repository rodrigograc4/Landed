export const STATUS_VALUES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "landed",
  "rejected",
  "rejectedAfterInterview",
  "ghosted",
];

export const INTERVIEWED_STATUSES = [
  "interviewing",
  "offer",
  "landed",
  "rejectedAfterInterview",
];

export const RESPONDED_STATUSES = [...INTERVIEWED_STATUSES, "rejected"];

export const ACTIVE_STATUSES = ["applied", "interviewing"];

export const UNSUCCESSFUL_STATUSES = [
  "rejected",
  "rejectedAfterInterview",
  "ghosted",
];

export const STATUS_WITHOUT_DATE = "saved";

export const STATUS_GROUPS = { landed: "offer" };

export const STATUS_COLORS = {
  saved: {
    fill: "bg-orange-200",
    text: "text-orange-900",
    bar: "bg-orange-300",
  },
  applied: { fill: "bg-sky-200", text: "text-sky-900", bar: "bg-sky-300" },
  interviewing: {
    fill: "bg-violet-200",
    text: "text-violet-900",
    bar: "bg-violet-300",
  },
  offer: {
    fill: "bg-emerald-200",
    text: "text-emerald-900",
    bar: "bg-emerald-300",
  },
  landed: {
    fill: "bg-emerald-200",
    text: "text-emerald-900",
    bar: "bg-emerald-300",
  },
  rejected: {
    fill: "bg-neutral-300",
    text: "text-neutral-700",
    bar: "bg-neutral-400",
  },
  rejectedAfterInterview: {
    fill: "bg-neutral-300",
    text: "text-neutral-700",
    bar: "bg-neutral-400",
  },
  ghosted: {
    fill: "bg-neutral-300",
    text: "text-neutral-700",
    bar: "bg-neutral-400",
  },
};

export const WORK_MODE_VALUES = ["remote", "hybrid", "onsite"];

export const DEFAULT_WORK_MODE = "remote";

export const GHOST_THRESHOLD_DAYS = 30;

export const TIMELINE_WEEKS = 8;

export const VIEW_VALUES = ["rows", "cards"];

export const PAGE_SIZE = 15;

export const SORT_VALUES = ["date", "company", "result"];

export const RESULT_ORDER = [
  "landed",
  "offer",
  "interviewing",
  "applied",
  "saved",
  "rejectedAfterInterview",
  "rejected",
  "ghosted",
];

export const UNKNOWN_KEY = "__unknown__";

export const UNSUCCESSFUL = "unsuccessful";

export const STORAGE_KEY = "landed:applications";
export const DELETED_KEY = "landed:deleted";
export const ARCHIVES_KEY = "landed:archives";
export const VIEW_KEY = "landed:view";
export const LANGUAGE_KEY = "landed:language";

export const GITHUB_REPO = "https://github.com/rodrigograc4/Landed";
export const GITHUB_PROFILE = "https://github.com/rodrigograc4";
export const GITHUB_LICENSE = `${GITHUB_REPO}/blob/main/LICENSE`;
