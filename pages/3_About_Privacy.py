# pages/3_About_Privacy.py
# About & Privacy documentation page.
# Covers core privacy rules, occupational hazard and health problem mapping table, and diagnostic disclaimer.

import streamlit as st
import pandas as pd
from i18n.strings import t, SECTOR_INFO
from ui.style import apply_style, privacy_notice, topbar

# Page configuration
st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

# Initialize session state keys
if "role" not in st.session_state:
    st.session_state.role = "public"
if "lang" not in st.session_state:
    st.session_state.lang = "en"
if "site_id" not in st.session_state:
    st.session_state.site_id = "S1"
if "sector" not in st.session_state:
    st.session_state.sector = None

# Apply theme and custom styling
apply_style()

lang = st.session_state.lang

# Render Top Bar navigation
topbar(page_name="About")

# Title & Intro
st.markdown(
    f"""
    <div style="margin-bottom: 20px;">
        <h2 style="color: #065f46; font-size: 1.8rem; margin: 0;">
            📖 {t("about_title", lang)}
        </h2>
        <p style="color: #4b5563; font-size: 0.95rem; margin-top: 4px;">
            {t("app_name", lang)} - {t("app_subtitle", lang)}
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# Mandatory Diagnostic Disclaimer Callout
st.markdown(
    f"""
    <div class="sanket-card" style="border-left: 5px solid #f59e0b; background-color: #fffbeb; padding: 14px 20px; font-size: 1.05rem; color: #92400e; font-weight: 600;">
        ⚠️ {t("tool_disclaimer", lang)}
    </div>
    """,
    unsafe_allow_html=True,
)

st.write("")

# Privacy Rules Section
st.markdown(f"### 🛡️ {t('privacy_rules_title', lang)}")

pr_col1, pr_col2 = st.columns(2, gap="medium")

with pr_col1:
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 110px;">
            <strong style="color: #065f46;">📊 1. Aggregated only</strong>
            <p style="color: #374151; font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">
                {t("rule_aggregated", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 110px;">
            <strong style="color: #065f46;">👥 2. Small counts under 5 hidden</strong>
            <p style="color: #374151; font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">
                {t("rule_small_counts", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 110px;">
            <strong style="color: #065f46;">🎭 3. Role-based views</strong>
            <p style="color: #374151; font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">
                {t("rule_role_views", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with pr_col2:
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 110px;">
            <strong style="color: #065f46;">🚫 4. Not for individual or disciplinary use</strong>
            <p style="color: #374151; font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">
                {t("rule_non_punitive", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 110px;">
            <strong style="color: #065f46;">🧪 5. All data simulated</strong>
            <p style="color: #374151; font-size: 0.9rem; margin-top: 6px; margin-bottom: 0;">
                {t("rule_simulated", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.write("")

# Table: Common health problems by occupation from SECTOR_INFO
st.markdown(f"### 🏭 {t('table_occ_health', lang)}")

sector_dict = SECTOR_INFO.get(lang, SECTOR_INFO["en"])
table_data = []

# Order of sectors specified in prompt: waste, farm, quarry, construction, textile
ordered_keys = ["waste", "farm", "quarry", "construction", "textile"]

for key in ordered_keys:
    if key in sector_dict:
        item = sector_dict[key]
        table_data.append(
            {
                t("col_occupation", lang): item["name"],
                t("col_hazards", lang): item["hazards"],
                t("col_health_problems", lang): item["health_problems"],
            }
        )

df_sectors = pd.DataFrame(table_data)

# Display styled table
st.dataframe(
    df_sectors,
    use_container_width=True,
    hide_index=True,
)

# Mandatory Privacy Notice at bottom
privacy_notice()
