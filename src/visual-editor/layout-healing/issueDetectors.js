import { gridColumns, snapFontScale, snapGridColumns, snapSpacing, spacingScale } from "./designTokens.js";

const DEFAULT_VIEWPORT = {
  desktop: 1200,
  tablet: 900,
  mobile: 390,
};

const safeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const contentLengthScore = (props = {}) => {
  const candidates = [
    props.title,
    props.subtitle,
    props.body,
    props.quote,
    props.cta,
    props.buttonText,
    props.planName,
    props.price,
    ...(Array.isArray(props.items) ? props.items : []),
    ...(Array.isArray(props.features) ? props.features : []),
  ];
  return candidates.reduce((total, entry) => total + safeText(entry).length, 0);
};

const estimateGridWidth = (props = {}) => {
  const columns = snapGridColumns(props.gridColumns, 2);
  const spacing = snapSpacing(props.spacing, 16);
  const padding = snapSpacing(props.padding, 24);
  const cardWidth = 280;
  return columns * cardWidth + Math.max(0, columns - 1) * spacing + padding * 2;
};

const hexToRgb = (value) => {
  const hex = String(value || "").trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) return null;
  const normalized = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;
  const numeric = Number.parseInt(normalized, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const luminanceChannel = (channel) => {
  const value = Number(channel) / 255;
  if (value <= 0.03928) return value / 12.92;
  return ((value + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (rgb) =>
  0.2126 * luminanceChannel(rgb.r) + 0.7152 * luminanceChannel(rgb.g) + 0.0722 * luminanceChannel(rgb.b);

const contrastRatio = (foregroundHex, backgroundHex) => {
  const foreground = hexToRgb(foregroundHex);
  const background = hexToRgb(backgroundHex);
  if (!foreground || !background) return null;
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const buildIssue = ({
  type,
  componentId,
  severity,
  message,
  details = {},
}) => ({
  type: String(type || "unknown"),
  componentId: String(componentId || ""),
  severity: String(severity || "low"),
  message: String(message || ""),
  details,
});

export const detectOverflow = (component, context = {}) => {
  const viewport = Number(context?.viewport?.desktop || DEFAULT_VIEWPORT.desktop);
  const estimatedWidth = estimateGridWidth(component?.props || {});
  if (estimatedWidth <= viewport) return [];
  return [
    buildIssue({
      type: "overflow",
      componentId: component.id,
      severity: estimatedWidth > viewport * 1.25 ? "high" : "medium",
      message: "Component grid width exceeds desktop viewport.",
      details: {
        estimatedWidth,
        viewport,
      },
    }),
  ];
};

export const detectMobileBreak = (component, context = {}) => {
  const viewport = Number(context?.viewport?.mobile || DEFAULT_VIEWPORT.mobile);
  const props = component?.props || {};
  const columns = snapGridColumns(props.gridColumns, 2);
  const mobileColumns = snapGridColumns(props.mobileColumns, Math.min(columns, 2));
  const estimatedMobileWidth = mobileColumns * 240 + Math.max(0, mobileColumns - 1) * snapSpacing(props.spacing, 16);
  const breaks = estimatedMobileWidth > viewport || (columns >= 3 && !props.mobileStack && mobileColumns > 1);
  if (!breaks) return [];
  return [
    buildIssue({
      type: "mobile-break",
      componentId: component.id,
      severity: "high",
      message: "Component layout is likely to break on mobile viewport.",
      details: {
        mobileColumns,
        estimatedMobileWidth,
        viewport,
      },
    }),
  ];
};

export const detectSpacing = (component) => {
  const props = component?.props || {};
  const spacing = Number(props.spacing);
  const padding = Number(props.padding);
  const issues = [];
  if (Number.isFinite(spacing) && !spacingScale.includes(spacing)) {
    issues.push(
      buildIssue({
        type: "spacing",
        componentId: component.id,
        severity: "low",
        message: "Spacing value is off token scale.",
        details: { spacing, nearest: snapSpacing(spacing) },
      })
    );
  }
  if (Number.isFinite(padding) && !spacingScale.includes(padding)) {
    issues.push(
      buildIssue({
        type: "spacing",
        componentId: component.id,
        severity: "low",
        message: "Padding value is off token scale.",
        details: { padding, nearest: snapSpacing(padding, 24) },
      })
    );
  }
  return issues;
};

export const detectContrast = (component) => {
  const props = component?.props || {};
  if (!props.textColor || !props.backgroundColor) return [];
  const ratio = contrastRatio(props.textColor, props.backgroundColor);
  if (ratio == null || ratio >= 4.5) return [];
  return [
    buildIssue({
      type: "contrast",
      componentId: component.id,
      severity: ratio < 3 ? "high" : "medium",
      message: "Text/background contrast ratio is below WCAG target.",
      details: {
        ratio,
        target: 4.5,
      },
    }),
  ];
};

export const detectTextOverflow = (component) => {
  const props = component?.props || {};
  const contentScore = contentLengthScore(props);
  const fontSize = snapFontScale(props.fontSize, 16);
  const lineClamp = Number(props.lineClamp || 0);
  const textLikelyOverflow = contentScore > 360 && (fontSize >= 24 || lineClamp === 0);
  if (!textLikelyOverflow) return [];
  return [
    buildIssue({
      type: "text-overflow",
      componentId: component.id,
      severity: contentScore > 520 ? "high" : "medium",
      message: "Component copy is likely to overflow its container.",
      details: {
        contentScore,
        fontSize,
        lineClamp,
      },
    }),
  ];
};

export const detectAlignmentIssues = (component) => {
  const props = component?.props || {};
  const columns = snapGridColumns(props.gridColumns, 2);
  const itemCount =
    Array.isArray(props.items) ? props.items.length : Array.isArray(props.features) ? props.features.length : 0;
  if (itemCount <= 0 || columns <= 1) return [];
  const orphaned = itemCount % columns;
  if (orphaned === 0) return [];
  return [
    buildIssue({
      type: "alignment",
      componentId: component.id,
      severity: orphaned === 1 ? "medium" : "low",
      message: "Grid alignment leaves orphaned cards in final row.",
      details: {
        itemCount,
        columns,
      },
    }),
  ];
};

export const runAllDetectors = (component, context = {}) => [
  ...detectOverflow(component, context),
  ...detectMobileBreak(component, context),
  ...detectSpacing(component, context),
  ...detectContrast(component, context),
  ...detectTextOverflow(component, context),
  ...detectAlignmentIssues(component, context),
];

export const LAYOUT_VIEWPORT_DEFAULTS = DEFAULT_VIEWPORT;
export const GRID_COLUMN_TOKENS = gridColumns;
