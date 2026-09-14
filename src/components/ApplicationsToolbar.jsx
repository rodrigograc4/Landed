import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownWideShort,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Select from "./Select";
import FiltersMenu from "./FiltersMenu";
import ViewToggle from "./ViewToggle";
import {
  SORT_VALUES,
  STATUS_VALUES,
  UNSUCCESSFUL,
  UNSUCCESSFUL_STATUSES,
  WORK_MODE_VALUES,
} from "../utils/constants";
import { useI18n } from "../i18n";

const controlClass = "bg-surface text-text rounded-full px-4 py-2.5";

export default function ApplicationsToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  favorites,
  onFavoritesChange,
  statuses,
  onStatusesChange,
  workModes,
  onWorkModesChange,
}) {
  const { t } = useI18n();

  const statusOptions = [
    ...STATUS_VALUES.filter(
      (value) => !UNSUCCESSFUL_STATUSES.includes(value),
    ).map((value) => ({ value, label: t(`status.${value}`) })),
    { value: UNSUCCESSFUL, label: t("applications.unsuccessful") },
  ];

  const workModeOptions = WORK_MODE_VALUES.map((value) => ({
    value,
    label: t(`workMode.${value}`),
  }));

  const sortOptions = SORT_VALUES.map((value) => ({
    value,
    label: t(`applications.sort_${value}`),
  }));

  const filterGroups = [
    {
      key: "favorite",
      options: [{ value: "favorite", label: t("applications.favoritesOnly") }],
      picked: favorites,
      onChange: onFavoritesChange,
    },
    {
      key: "status",
      allLabel: t("applications.allStatuses"),
      options: statusOptions,
      picked: statuses,
      onChange: onStatusesChange,
    },
    {
      key: "workMode",
      allLabel: t("applications.allWorkModes"),
      options: workModeOptions,
      picked: workModes,
      onChange: onWorkModesChange,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-[180px] flex-1">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-light-gray absolute top-1/2 left-4 -translate-y-1/2 text-xs"
        />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("applications.search")}
          className="bg-surface placeholder:text-light-gray text-text w-full rounded-full py-2.5 pr-4 pl-10 text-sm"
        />
      </div>

      <ViewToggle view={view} onChange={onViewChange} />

      <div className="w-full sm:w-44">
        <Select
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
          icon={faArrowDownWideShort}
          className={controlClass}
        />
      </div>

      <div className="w-full sm:w-52">
        <FiltersMenu groups={filterGroups} className={controlClass} />
      </div>
    </div>
  );
}
