export const spacingScale = [4, 8, 16, 24, 32, 48, 64];
export const fontScale = [12, 14, 16, 20, 24, 32, 40, 48];
export const gridColumns = [1, 2, 3, 4];

const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

export const snapToToken = (value, tokens, fallback) => {
  const safeTokens = Array.isArray(tokens) ? tokens.filter((token) => Number.isFinite(token)) : [];
  if (safeTokens.length === 0) return Number(fallback || 0);
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return Number.isFinite(fallback) ? Number(fallback) : safeTokens[0];
  }
  return safeTokens.reduce((nearest, token) => {
    if (Math.abs(token - numericValue) < Math.abs(nearest - numericValue)) return token;
    return nearest;
  }, safeTokens[0]);
};

export const snapSpacing = (value, fallback = 16) => snapToToken(value, spacingScale, fallback);
export const snapFontScale = (value, fallback = 16) => snapToToken(value, fontScale, fallback);
export const snapGridColumns = (value, fallback = 2) => snapToToken(value, gridColumns, fallback);

export const withLayoutDefaults = (props = {}) => {
  const next = props && typeof props === "object" ? { ...props } : {};
  const spacing = snapSpacing(next.spacing, 16);
  const padding = snapSpacing(next.padding, 24);
  const fontSize = snapFontScale(next.fontSize, 16);
  const columns = snapGridColumns(next.gridColumns, 2);
  const mobileColumns = snapGridColumns(next.mobileColumns, Math.min(columns, 2));

  return {
    layout: String(next.layout || "stack"),
    spacing,
    padding,
    fontSize,
    gridColumns: columns,
    mobileColumns,
    lineClamp: clampNumber(Number(next.lineClamp || 0), 0, 6),
    mobileStack: Boolean(next.mobileStack),
    textColor: String(next.textColor || ""),
    backgroundColor: String(next.backgroundColor || ""),
    ...next,
  };
};

export const DESIGN_TOKENS = {
  spacingScale,
  fontScale,
  gridColumns,
};
