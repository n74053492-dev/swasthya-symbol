# app.py
# Landing page for Sanket - Occupational Health Early Warning.
# Features hand-sketch layout, bilingual toggle, role dialogs, project story card, and rising trend chart.

import streamlit as st
import plotly.graph_objects as go
import pandas as pd

import api
from i18n.strings import t
from ui.style import apply_style, privacy_notice

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


# Dialog for Sign in and Sign up
def render_auth_dialog(is_signup: bool = False):
    """Renders role selection modal and continues to dashboard."""
    title_text = t("sign_up", lang) if is_signup else t("sign_in", lang)
    st.write(f"### {title_text}")

    role_map = {
        t("role_health_officer", lang): "health_officer",
        t("role_inspector", lang): "inspector",
        t("role_public", lang): "public",
    }
    role_options = list(role_map.keys())
    selected_label = st.selectbox(t("select_role", lang), options=role_options)
    selected_role_val = role_map[selected_label]

    if is_signup:
        st.info(f"ℹ️ {t('demo_signup_notice', lang)}")

    if st.button(t("continue_btn", lang), type="primary", use_container_width=True):
        st.session_state.role = selected_role_val
        st.switch_page("pages/1_Dashboard.py")


# Support st.dialog decorator if available
if hasattr(st, "dialog"):
    @st.dialog(t("sign_in", lang))
    def auth_dialog_modal(is_signup: bool = False):
        render_auth_dialog(is_signup)
else:
    def auth_dialog_modal(is_signup: bool = False):
        with st.expander(t("sign_up", lang) if is_signup else t("sign_in", lang), expanded=True):
            render_auth_dialog(is_signup)


# Top header bar: Language toggle on left, Sign in / Sign up on right
top_col1, _, top_col3 = st.columns([2, 5, 3])

with top_col1:
    # Top-left Hindi | English toggle
    curr_lang = st.session_state.lang
    lang_btn_text = "हिन्दी (Hindi)" if curr_lang == "en" else "English"
    if st.button(f"🌐 {lang_btn_text}", key="landing_lang_toggle"):
        st.session_state.lang = "hi" if curr_lang == "en" else "en"
        st.rerun()

with top_col3:
    # Top-right Sign in and Sign up buttons
    btn_col1, btn_col2 = st.columns(2)
    with btn_col1:
        if st.button(t("sign_in", lang), key="landing_sign_in", use_container_width=True):
            auth_dialog_modal(is_signup=False)
    with btn_col2:
        if st.button(t("sign_up", lang), key="landing_sign_up", use_container_width=True):
            auth_dialog_modal(is_signup=True)

st.write("")

# Main 2-column layout (Left: Title + Story card, Right: Trend chart)
left_col, right_col = st.columns([1, 1], gap="large")

with left_col:
    # Health Symbol (Rod of Asclepius / Arogya) and Title
    st.markdown(
        f"""
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
            <span style="font-size: 3.5rem;" title="{t('symbol_name', lang)}" aria-label="{t('symbol_name', lang)}">⚕️</span>
            <div>
                <h1 style="font-size: 2.8rem; font-weight: 800; color: #065f46; margin: 0; line-height: 1.1;">
                    {t("app_name", lang)}
                </h1>
                <p style="font-size: 1.1rem; color: #374151; margin-top: 4px; font-weight: 500;">
                    {t("app_subtitle", lang)}
                </p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 4-5 simple lines about the project inside a white card
    st.markdown(
        f"""
        <div class="sanket-card" style="font-size: 1rem; line-height: 1.7; color: #1f2937;">
            <p><strong>1.</strong> {t("landing_line_1", lang)}</p>
            <p><strong>2.</strong> {t("landing_line_2", lang)}</p>
            <p><strong>3.</strong> {t("landing_line_3", lang)}</p>
            <p><strong>4.</strong> {t("landing_line_4", lang)}</p>
            <p style="color: #4b5563; font-style: italic; margin-bottom: 0;">
                <strong>5.</strong> {t("landing_line_5", lang)}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with right_col:
    st.markdown(
        f'<div style="font-weight: 600; font-size: 1.15rem; color: #065f46; margin-bottom: 8px;">📈 {t("trend_title", lang)}: S1 (Early Signal Rise)</div>',
        unsafe_allow_html=True,
    )

    # Plotly chart card with 3 lines (clinic visits purple, absence orange, environment green)
    try:
        raw_trend = api.get_trends("S1", "health_officer")
        df_trend = pd.DataFrame(raw_trend) if not isinstance(raw_trend, pd.DataFrame) else raw_trend

        fig = go.Figure()

        # Identify x-axis (weeks)
        x_vals = df_trend["week"] if "week" in df_trend.columns else list(range(1, len(df_trend) + 1))

        # 1. Clinic visits (purple)
        clinic_cols = [c for c in df_trend.columns if "clinic" in c.lower()]
        if clinic_cols:
            fig.add_trace(
                go.Scatter(
                    x=x_vals,
                    y=df_trend[clinic_cols[0]],
                    mode="lines+markers",
                    name=t("signal_clinic", lang),
                    line=dict(color="#7c3aed", width=3, shape="spline"),
                    connectgaps=False,
                )
            )

        # 2. Absence (orange)
        absence_cols = [c for c in df_trend.columns if "absenc" in c.lower()]
        if absence_cols:
            fig.add_trace(
                go.Scatter(
                    x=x_vals,
                    y=df_trend[absence_cols[0]],
                    mode="lines+markers",
                    name=t("signal_absence", lang),
                    line=dict(color="#ea580c", width=3, shape="spline"),
                    connectgaps=False,
                )
            )

        # 3. Environment (dust and heat) (green)
        env_cols = [c for c in df_trend.columns if any(k in c.lower() for k in ["env", "dust", "heat"])]
        if env_cols:
            fig.add_trace(
                go.Scatter(
                    x=x_vals,
                    y=df_trend[env_cols[0]],
                    mode="lines+markers",
                    name=t("signal_environment", lang),
                    line=dict(color="#059669", width=3, shape="spline"),
                    connectgaps=False,
                )
            )

        fig.update_layout(
            margin=dict(l=20, r=20, t=20, b=20),
            plot_bgcolor="rgba(255, 255, 255, 0.85)",
            paper_bgcolor="rgba(255, 255, 255, 0.85)",
            height=300,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            xaxis=dict(title=t("week", lang), showgrid=True, gridcolor="#e5e7eb"),
            yaxis=dict(showgrid=True, gridcolor="#e5e7eb"),
        )

        st.plotly_chart(fig, use_container_width=True)
    except Exception as e:
        st.warning(f"Unable to load sample trend: {e}")

# Open dashboard button below
st.write("")
if st.button(f"🚀 {t('open_dashboard', lang)}", type="primary", use_container_width=True):
    st.switch_page("pages/1_Dashboard.py")

# Privacy notice at bottom
privacy_notice()
