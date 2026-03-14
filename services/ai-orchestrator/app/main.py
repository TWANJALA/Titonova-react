from datetime import datetime
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="TitoNova AI Orchestrator", version="0.1.0")


class ClonePlanRequest(BaseModel):
    url: str = Field(..., min_length=3)
    mode: str = Field(default="full")


class ClonePlanResponse(BaseModel):
    ok: bool
    created_at: str
    plan: dict[str, Any]


class DesignSystemMapRequest(BaseModel):
    industry: str = Field(default="general")
    emphasis: str = Field(default="conversion")


class DesignSystemMapResponse(BaseModel):
    ok: bool
    created_at: str
    design_system: dict[str, Any]


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "service": "ai-orchestrator",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/v1/clone/plan", response_model=ClonePlanResponse)
def build_clone_plan(payload: ClonePlanRequest) -> ClonePlanResponse:
    plan = {
        "url": payload.url,
        "mode": payload.mode,
        "pipeline": [
            "headless_browser_render",
            "dom_css_extraction",
            "layout_detection",
            "component_detection",
            "vision_analysis",
            "dom_vision_fusion",
            "design_system_extraction",
            "code_generation",
            "pixel_validation",
            "export",
        ],
        "accuracy_target": {
            "pixel_similarity_min": 0.97,
            "dom_visual_consistency_min": 0.95,
        },
        "outputs": [
            "pages",
            "components",
            "assets",
            "responsive_signals",
            "design_tokens",
            "component_library",
        ],
        "editable_components": ["Button", "Card", "Navbar", "Section", "Footer"],
    }
    return ClonePlanResponse(
        ok=True,
        created_at=datetime.utcnow().isoformat() + "Z",
        plan=plan,
    )


@app.post("/v1/clone/design-system-map", response_model=DesignSystemMapResponse)
def build_design_system_map(payload: DesignSystemMapRequest) -> DesignSystemMapResponse:
    industry = payload.industry.strip().lower() or "general"

    token_presets: dict[str, dict[str, str]] = {
        "healthcare": {
            "primary": "#1f6feb",
            "secondary": "#0c9b72",
            "surface": "#f7fbff",
            "text": "#10243e",
            "radius": "12px",
        },
        "saas": {
            "primary": "#2563eb",
            "secondary": "#22c55e",
            "surface": "#f8fafc",
            "text": "#0f172a",
            "radius": "14px",
        },
        "e-commerce": {
            "primary": "#111827",
            "secondary": "#f59e0b",
            "surface": "#fffbeb",
            "text": "#1f2937",
            "radius": "10px",
        },
        "general": {
            "primary": "#0f172a",
            "secondary": "#2563eb",
            "surface": "#f8fafc",
            "text": "#0b1220",
            "radius": "12px",
        },
    }

    design_system = {
        "industry": industry,
        "emphasis": payload.emphasis,
        "tokens": token_presets.get(industry, token_presets["general"]),
        "typography": {
            "heading": "Inter",
            "body": "Inter",
            "scale": [12, 14, 16, 20, 28, 40, 56],
        },
        "components": [
            {
                "name": "Button",
                "variants": ["primary", "secondary", "ghost"],
                "props": ["label", "href", "size", "icon"],
            },
            {
                "name": "Card",
                "variants": ["feature", "testimonial", "pricing"],
                "props": ["title", "description", "media", "cta"],
            },
            {
                "name": "Navbar",
                "variants": ["simple", "mega-menu", "sticky"],
                "props": ["logo", "items", "cta"],
            },
        ],
    }

    return DesignSystemMapResponse(
        ok=True,
        created_at=datetime.utcnow().isoformat() + "Z",
        design_system=design_system,
    )
