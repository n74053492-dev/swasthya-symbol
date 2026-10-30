// Utility for strict small-cell suppression and privacy safeguards

export const SMALL_CELL_THRESHOLD = 5;

/**
 * Suppresses counts between 1 and 4 inclusive.
 * 0 is allowed (indicates zero count).
 * Null/undefined indicates missing data.
 */
export function formatSmallCellCount(
  count: number | null | undefined,
  placeholder: string = '<5'
): string {
  if (count === null || count === undefined) {
    return '—';
  }
  if (count > 0 && count < SMALL_CELL_THRESHOLD) {
    return placeholder;
  }
  return count.toString();
}

/**
 * Returns safe tooltip string that never reveals suppressed counts.
 */
export function getSafeCountTooltip(count: number | null | undefined): string {
  if (count === null || count === undefined) {
    return 'Data not reported for this observation';
  }
  if (count > 0 && count < SMALL_CELL_THRESHOLD) {
    return 'Value suppressed: Aggregated count is fewer than 5 individuals (Privacy Rule)';
  }
  return `${count} aggregated visits`;
}

/**
 * Sanitizes an array of counts for charting without leaking raw small cells.
 * For plotting, small cells can either be represented as null or clamped to a safe anonymized band.
 */
export function sanitizeChartValue(count: number | null | undefined): number | null {
  if (count === null || count === undefined) return null;
  if (count > 0 && count < SMALL_CELL_THRESHOLD) return null; // hide or suppress point to prevent inference
  return count;
}
