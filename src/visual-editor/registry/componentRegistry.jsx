/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { withLayoutDefaults } from "../layout-healing/designTokens";

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 22,
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
};

const layoutStyle = (props = {}, overrides = {}) => {
  const layout = withLayoutDefaults(props);
  const base = {
    ...cardStyle,
    padding: layout.padding,
    color: layout.textColor || undefined,
    background: layout.backgroundColor || cardStyle.background,
    display: "grid",
    gap: layout.spacing,
  };
  return {
    ...base,
    ...overrides,
  };
};

function Hero({
  title = "AI Home Care",
  subtitle = "Dallas Healthcare",
  cta = "Schedule a Tour",
  buttonUrl = "#contact",
  backgroundImageUrl = "",
  ...layoutProps
}) {
  const layout = withLayoutDefaults(layoutProps);
  return (
    <section style={layoutStyle(layout, { background: layout.backgroundColor || "linear-gradient(135deg,#eff6ff,#ffffff)" })}>
      {backgroundImageUrl ? (
        <img
          src={backgroundImageUrl}
          alt={title}
          style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, marginBottom: 16 }}
        />
      ) : null}
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: Math.max(24, layout.fontSize + 20),
          lineHeight: 1.1,
          display: "-webkit-box",
          WebkitLineClamp: layout.lineClamp > 0 ? layout.lineClamp : "unset",
          WebkitBoxOrient: "vertical",
          overflow: layout.lineClamp > 0 ? "hidden" : "visible",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: "0 0 16px", color: "#334155", fontSize: Math.max(14, layout.fontSize + 2) }}>{subtitle}</p>
      <a
        href={buttonUrl}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          background: "#2563eb",
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: 9,
          fontWeight: 700,
        }}
      >
        {cta}
      </a>
    </section>
  );
}

function TextBlock({ title = "Section Title", body = "Section body copy.", ...layoutProps }) {
  const layout = withLayoutDefaults(layoutProps);
  return (
    <section style={layoutStyle(layout)}>
      <h2 style={{ margin: "0 0 8px", fontSize: Math.max(20, layout.fontSize + 10), lineHeight: 1.2 }}>{title}</h2>
      <p
        style={{
          margin: 0,
          color: "#334155",
          fontSize: layout.fontSize,
          display: "-webkit-box",
          WebkitLineClamp: layout.lineClamp > 0 ? layout.lineClamp : "unset",
          WebkitBoxOrient: "vertical",
          overflow: layout.lineClamp > 0 ? "hidden" : "visible",
        }}
      >
        {body}
      </p>
    </section>
  );
}

function Services({ title = "Services", items = [], ...layoutProps }) {
  const layout = withLayoutDefaults(layoutProps);
  const activeColumns = layout.mobileStack ? 1 : Math.max(1, layout.gridColumns);
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <section style={layoutStyle(layout)}>
      <h2 style={{ margin: "0 0 12px", fontSize: Math.max(20, layout.fontSize + 10) }}>{title}</h2>
      <div
        style={{
          display: "grid",
          gap: layout.spacing,
          gridTemplateColumns: `repeat(${activeColumns}, minmax(0, 1fr))`,
        }}
      >
        {safeItems.map((item, index) => (
          <article key={`${item}-${index}`} style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 12 }}>
            <strong>{item}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ title = "Testimonials", quote = "Excellent service.", author = "Happy Client", ...layoutProps }) {
  const layout = withLayoutDefaults(layoutProps);
  return (
    <section style={layoutStyle(layout)}>
      <h2 style={{ margin: "0 0 10px", fontSize: Math.max(20, layout.fontSize + 10) }}>{title}</h2>
      <blockquote style={{ margin: "0 0 8px", color: "#1e293b", fontStyle: "italic" }}>
        "{quote}"
      </blockquote>
      <p style={{ margin: 0, color: "#475569" }}>- {author}</p>
    </section>
  );
}

function CTA({ title = "Ready to get started?", buttonText = "Book a Call", buttonUrl = "#contact", ...layoutProps }) {
  const layout = withLayoutDefaults(layoutProps);
  return (
    <section style={layoutStyle(layout, { textAlign: "center", background: layout.backgroundColor || "#f8fafc" })}>
      <h2 style={{ margin: "0 0 12px", fontSize: Math.max(20, layout.fontSize + 12) }}>{title}</h2>
      <a
        href={buttonUrl}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          background: "#16a34a",
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: 9,
          fontWeight: 700,
        }}
      >
        {buttonText}
      </a>
    </section>
  );
}

function Pricing({
  title = "Pricing",
  planName = "Starter",
  price = "$99/mo",
  features = [],
  buttonText = "Choose Plan",
  ...layoutProps
}) {
  const layout = withLayoutDefaults(layoutProps);
  const safeFeatures = Array.isArray(features) ? features : [];
  return (
    <section style={layoutStyle(layout)}>
      <h2 style={{ margin: "0 0 12px", fontSize: Math.max(20, layout.fontSize + 10) }}>{title}</h2>
      <article style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14 }}>
        <strong style={{ display: "block", fontSize: 20 }}>{planName}</strong>
        <p style={{ margin: "6px 0 10px", fontSize: 24, fontWeight: 800 }}>{price}</p>
        <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
          {safeFeatures.map((feature, index) => (
            <li key={`${feature}-${index}`}>{feature}</li>
          ))}
        </ul>
        <button
          type="button"
          style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#0f172a", color: "#ffffff" }}
        >
          {buttonText}
        </button>
      </article>
    </section>
  );
}

export const componentRegistry = {
  Hero,
  TextBlock,
  Services,
  Testimonials,
  CTA,
  Pricing,
};

const COMMON_LAYOUT_DEFAULTS = {
  layout: "stack",
  spacing: 16,
  padding: 24,
  fontSize: 16,
  gridColumns: 2,
  mobileColumns: 1,
  mobileStack: false,
  lineClamp: 0,
  textColor: "",
  backgroundColor: "",
};

const COMMON_LAYOUT_FIELDS = [
  { key: "layout", label: "Layout (stack/grid)", type: "text" },
  { key: "spacing", label: "Spacing", type: "text" },
  { key: "padding", label: "Padding", type: "text" },
  { key: "fontSize", label: "Font Size", type: "text" },
  { key: "gridColumns", label: "Grid Columns", type: "text" },
  { key: "mobileColumns", label: "Mobile Columns", type: "text" },
  { key: "mobileStack", label: "Mobile Stack", type: "checkbox" },
  { key: "lineClamp", label: "Line Clamp", type: "text" },
  { key: "textColor", label: "Text Color (#hex)", type: "text" },
  { key: "backgroundColor", label: "Background Color (#hex)", type: "text" },
];

export const componentDefinitionRegistry = {
  Hero: {
    label: "Hero",
    defaultProps: {
      title: "AI Home Care",
      subtitle: "Dallas Healthcare",
      cta: "Schedule a Tour",
      buttonUrl: "#contact",
      backgroundImageUrl: "",
      ...COMMON_LAYOUT_DEFAULTS,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta", label: "CTA Label", type: "text" },
      { key: "buttonUrl", label: "CTA URL", type: "url" },
      { key: "backgroundImageUrl", label: "Background Image URL", type: "url" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
  TextBlock: {
    label: "Text Block",
    defaultProps: {
      title: "Our Heartfelt Commitment",
      body: "Clean Website",
      ...COMMON_LAYOUT_DEFAULTS,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
  Services: {
    label: "Services",
    defaultProps: {
      title: "Services",
      items: ["Service 1", "Service 2", "Service 3"],
      ...COMMON_LAYOUT_DEFAULTS,
      layout: "grid",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Items (one per line)", type: "list" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
  Testimonials: {
    label: "Testimonials",
    defaultProps: {
      title: "Testimonials",
      quote: "Excellent service.",
      author: "Happy Client",
      ...COMMON_LAYOUT_DEFAULTS,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
  CTA: {
    label: "CTA",
    defaultProps: {
      title: "Ready to get started?",
      buttonText: "Book a Call",
      buttonUrl: "#contact",
      ...COMMON_LAYOUT_DEFAULTS,
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "url" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
  Pricing: {
    label: "Pricing",
    defaultProps: {
      title: "Pricing",
      planName: "Starter",
      price: "$99/mo",
      features: ["Feature A", "Feature B", "Feature C"],
      buttonText: "Choose Plan",
      ...COMMON_LAYOUT_DEFAULTS,
      layout: "grid",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "planName", label: "Plan Name", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "features", label: "Features (one per line)", type: "list" },
      { key: "buttonText", label: "Button Text", type: "text" },
      ...COMMON_LAYOUT_FIELDS,
    ],
  },
};

export const getComponentDefinition = (type) =>
  componentDefinitionRegistry[String(type || "")] || componentDefinitionRegistry.TextBlock;
