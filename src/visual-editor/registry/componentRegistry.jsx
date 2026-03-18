import React from "react";

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 22,
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
};

function Hero({
  title = "AI Home Care",
  subtitle = "Dallas Healthcare",
  cta = "Schedule a Tour",
  buttonUrl = "#contact",
  backgroundImageUrl = "",
}) {
  return (
    <section style={{ ...cardStyle, background: "linear-gradient(135deg,#eff6ff,#ffffff)" }}>
      {backgroundImageUrl ? (
        <img
          src={backgroundImageUrl}
          alt={title}
          style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, marginBottom: 16 }}
        />
      ) : null}
      <h1 style={{ margin: "0 0 8px", fontSize: 36, lineHeight: 1.1 }}>{title}</h1>
      <p style={{ margin: "0 0 16px", color: "#334155", fontSize: 18 }}>{subtitle}</p>
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

function TextBlock({ title = "Section Title", body = "Section body copy." }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, lineHeight: 1.2 }}>{title}</h2>
      <p style={{ margin: 0, color: "#334155" }}>{body}</p>
    </section>
  );
}

function Services({ title = "Services", items = [] }) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>{title}</h2>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        {safeItems.map((item, index) => (
          <article key={`${item}-${index}`} style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 12 }}>
            <strong>{item}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ title = "Testimonials", quote = "Excellent service.", author = "Happy Client" }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 10px", fontSize: 28 }}>{title}</h2>
      <blockquote style={{ margin: "0 0 8px", color: "#1e293b", fontStyle: "italic" }}>
        "{quote}"
      </blockquote>
      <p style={{ margin: 0, color: "#475569" }}>- {author}</p>
    </section>
  );
}

function CTA({ title = "Ready to get started?", buttonText = "Book a Call", buttonUrl = "#contact" }) {
  return (
    <section style={{ ...cardStyle, textAlign: "center", background: "#f8fafc" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 30 }}>{title}</h2>
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
}) {
  const safeFeatures = Array.isArray(features) ? features : [];
  return (
    <section style={cardStyle}>
      <h2 style={{ margin: "0 0 12px", fontSize: 28 }}>{title}</h2>
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

export const componentDefinitionRegistry = {
  Hero: {
    label: "Hero",
    defaultProps: {
      title: "AI Home Care",
      subtitle: "Dallas Healthcare",
      cta: "Schedule a Tour",
      buttonUrl: "#contact",
      backgroundImageUrl: "",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta", label: "CTA Label", type: "text" },
      { key: "buttonUrl", label: "CTA URL", type: "url" },
      { key: "backgroundImageUrl", label: "Background Image URL", type: "url" },
    ],
  },
  TextBlock: {
    label: "Text Block",
    defaultProps: {
      title: "Our Heartfelt Commitment",
      body: "Clean Website",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
  },
  Services: {
    label: "Services",
    defaultProps: {
      title: "Services",
      items: ["Service 1", "Service 2", "Service 3"],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Items (one per line)", type: "list" },
    ],
  },
  Testimonials: {
    label: "Testimonials",
    defaultProps: {
      title: "Testimonials",
      quote: "Excellent service.",
      author: "Happy Client",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
    ],
  },
  CTA: {
    label: "CTA",
    defaultProps: {
      title: "Ready to get started?",
      buttonText: "Book a Call",
      buttonUrl: "#contact",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "url" },
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
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "planName", label: "Plan Name", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "features", label: "Features (one per line)", type: "list" },
      { key: "buttonText", label: "Button Text", type: "text" },
    ],
  },
};

export const getComponentDefinition = (type) =>
  componentDefinitionRegistry[String(type || "")] || componentDefinitionRegistry.TextBlock;
