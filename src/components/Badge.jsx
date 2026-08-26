import { STATUS_COLORS } from "../utils/constants";
import { useI18n } from "../i18n";

export function StatusBadge({ status }) {
  const { t } = useI18n();
  const { fill, text } = STATUS_COLORS[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${fill} ${text}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
