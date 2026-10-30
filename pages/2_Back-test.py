# pages/2_Back-test.py
# Back-test evaluation page showing performance metrics, latency notes, and scenario counts.

import streamlit as st
import api
from i18n.strings import t
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
topbar(page_name="Back-test")

# Page Header
st.markdown(
    f"""
    <div style="margin-bottom: 20px;">
        <h2 style="color: #065f46; font-size: 1.8rem; margin: 0;">
            🧪 {t("backtest_title", lang)}
        </h2>
        <p style="color: #4b5563; font-size: 0.95rem; margin-top: 4px;">
            {t("app_name", lang)} - {t("simulated_data_note", lang)}
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# Fetch backtest metrics from api
try:
    backtest_data = api.get_backtest()
except Exception as e:
    st.error(f"Error fetching back-test results: {e}")
    backtest_data = {}

# Parse metrics safely
lead_time = backtest_data.get("lead_time_weeks", 0)
sensitivity_raw = backtest_data.get("sensitivity", 0)
ppv_raw = backtest_data.get("ppv", 0)
false_alarms = backtest_data.get("false_alarms", 0)

# Format percentages
def format_pct(val):
    if isinstance(val, (int, float)):
        if 0 < val <= 1.0:
            return f"{val * 100:.1f}%"
        return f"{val}%"
    return str(val)

sens_str = format_pct(sensitivity_raw)
ppv_str = format_pct(ppv_raw)

# 4 metric cards
m1, m2, m3, m4 = st.columns(4, gap="medium")

with m1:
    st.metric(
        label=t("lead_time_weeks", lang),
        value=f"{lead_time} wks",
        help="Average advance warning time before acute clinical surge",
    )

with m2:
    st.metric(
        label=t("sensitivity", lang),
        value=sens_str,
        help="Proportion of actual occupational hazard surges correctly detected",
    )

with m3:
    st.metric(
        label=t("ppv", lang),
        value=ppv_str,
        help="Positive Predictive Value: probability that a triggered alert reflects true hazard",
    )

with m4:
    st.metric(
        label=t("false_alarms", lang),
        value=str(false_alarms),
        help="Frequency of unconfirmed signals per site per monitoring year",
    )

st.write("")

# Honest line required by spec
st.markdown(
    f"""
    <div class="sanket-card" style="border-left: 5px solid #059669; padding: 14px 20px; font-size: 1rem; color: #065f46; font-weight: 600;">
        📌 {t("simulated_data_note", lang)}
    </div>
    """,
    unsafe_allow_html=True,
)

# Info boxes below for n_scenarios, data_latency_note, missing_data_behavior
n_scenarios = backtest_data.get("n_scenarios", "N/A")
data_latency_note = backtest_data.get("data_latency_note", "Standard 1-2 week reporting lag modeled.")
missing_data_behavior = backtest_data.get("missing_data_behavior", "Short gaps (<2 wks) interpolated; persistent gaps halt alerts.")

st.markdown(f"### 📋 {t('assumptions', lang)} & Experimental Parameters")

info_col1, info_col2, info_col3 = st.columns(3, gap="medium")

with info_col1:
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 140px;">
            <strong style="color: #065f46; font-size: 1rem;">🔬 {t('scenarios_evaluated', lang)}</strong>
            <div style="font-size: 2rem; font-weight: 700; color: #111827; margin: 8px 0;">
                {n_scenarios}
            </div>
            <span style="font-size: 0.85rem; color: #6b7280;">Simulated operational scenarios across sectors</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

with info_col2:
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 140px;">
            <strong style="color: #065f46; font-size: 1rem;">⏱️ {t('data_latency_note', lang)}</strong>
            <p style="font-size: 0.9rem; color: #374151; margin-top: 8px;">
                {data_latency_note}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with info_col3:
    st.markdown(
        f"""
        <div class="sanket-card" style="min-height: 140px;">
            <strong style="color: #065f46; font-size: 1rem;">🩹 {t('missing_data_behavior', lang)}</strong>
            <p style="font-size: 0.9rem; color: #374151; margin-top: 8px;">
                {missing_data_behavior}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

# Privacy notice at bottom
privacy_notice()
