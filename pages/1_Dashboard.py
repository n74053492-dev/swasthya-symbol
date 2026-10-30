# pages/1_Dashboard.py
# Main operational dashboard for Sanket.
# Displays occupation filter chips, 3-column analysis (Sites, Trends with alert marker, Alert explanation),
# and bottom row with data completeness, what-if simulation, and privacy notice.

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import math

import api
from i18n.strings import t
from ui.style import apply_style, badge, privacy_notice, topbar

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
role = st.session_state.role

# Render Top Bar navigation
topbar(page_name="Dashboard")

# Fetch current site_id
site_id = st.session_state.site_id

# Header action row with Download Report button
head_col1, head_col2 = st.columns([4, 1.2])
with head_col1:
    st.markdown(
        f'<h2 style="margin: 0; color: #065f46; font-size: 1.6rem;">{t("nav_dashboard", lang)}</h2>',
        unsafe_allow_html=True,
    )
with head_col2:
    try:
        report_data = api.export_report(site_id, role, lang)
        st.download_button(
            label=f"📥 {t('download_report', lang)}",
            data=report_data,
            file_name=f"sanket_report_{site_id}_{lang}.md",
            mime="text/markdown",
            use_container_width=True,
        )
    except Exception as e:
        st.caption(f"Report export unavailable: {e}")

st.write("")

# Occupation filter chips: All, Farm, Quarry, Construction, Waste, Textile
sector_keys = ["all", "farm", "quarry", "construction", "waste", "textile"]
current_sector = st.session_state.sector
default_idx = 0
if current_sector in sector_keys:
    default_idx = sector_keys.index(current_sector)

if hasattr(st, "pills"):
    selected_chip = st.pills(
        label="Occupation filter",
        options=sector_keys,
        format_func=lambda k: t(f"sector_{k}", lang),
        default=sector_keys[default_idx],
        label_visibility="collapsed",
    )
    new_sector_val = None if selected_chip == "all" else (selected_chip.lower() if selected_chip else None)
    if new_sector_val != st.session_state.sector:
        st.session_state.sector = new_sector_val
        st.rerun()
else:
    selected_chip = st.radio(
        label="Occupation filter",
        options=sector_keys,
        index=default_idx,
        format_func=lambda k: t(f"sector_{k}", lang),
        horizontal=True,
        label_visibility="collapsed",
    )
    new_sector_val = None if selected_chip == "all" else selected_chip.lower()
    if new_sector_val != st.session_state.sector:
        st.session_state.sector = new_sector_val
        st.rerun()

st.write("")

# Fetch Sites from api
try:
    raw_sites = api.get_sites(role, st.session_state.sector)
    sites_list = raw_sites.to_dict("records") if isinstance(raw_sites, pd.DataFrame) else list(raw_sites)
except Exception as e:
    st.error(f"Error loading sites: {e}")
    sites_list = []

# Validate site_id exists in list, otherwise select first site by default
site_ids = [s.get("site_id", s.get("id")) for s in sites_list if isinstance(s, dict)]
if sites_list and (st.session_state.site_id not in site_ids):
    st.session_state.site_id = site_ids[0]
    site_id = site_ids[0]

# Determine current site object & name
current_site_obj = next((s for s in sites_list if s.get("site_id", s.get("id")) == site_id), None)
current_site_name = current_site_obj.get("name", current_site_obj.get("site_name", site_id)) if current_site_obj else site_id


# Three columns layout (1 : 2 : 1.3)
col_left, col_center, col_right = st.columns([1.0, 2.0, 1.3], gap="medium")

# --- LEFT COLUMN: Sites list ---
with col_left:
    st.markdown(
        f'<div class="sanket-card" style="padding: 12px 16px; margin-bottom: 8px;">'
        f'<strong style="font-size: 1.1rem; color: #065f46;">📍 {t("sites_title", lang)} ({len(sites_list)})</strong>'
        f'</div>',
        unsafe_allow_html=True,
    )

    with st.container():
        for s in sites_list:
            s_id = s.get("site_id", s.get("id"))
            s_name = s.get("name", s.get("site_name", s_id))
            raw_risk = s.get("risk_score", s.get("risk"))

            # Risk label logic
            if raw_risk is None or (isinstance(raw_risk, float) and math.isnan(raw_risk)):
                badge_html = f'<span class="badge-watch" style="background-color: #f1f5f9; color: #64748b; border-color: #cbd5e1;">{t("hidden_risk", lang)}</span>'
            else:
                score_num = int(raw_risk)
                lvl_class = "badge-high" if score_num >= 70 else ("badge-watch" if score_num >= 40 else "badge-normal")
                badge_html = f'<span class="{lvl_class}">{t("risk", lang)} {score_num}</span>'

            # Selection highlight
            is_selected = (s_id == site_id)
            btn_type = "primary" if is_selected else "secondary"
            btn_label = f"{'👉 ' if is_selected else ''}{s_name}"

            row_c1, row_c2 = st.columns([2.5, 1.8])
            with row_c1:
                if st.button(btn_label, key=f"site_btn_{s_id}", type=btn_type, use_container_width=True):
                    st.session_state.site_id = s_id
                    st.rerun()
            with row_c2:
                st.markdown(f'<div style="padding-top: 6px;">{badge_html}</div>', unsafe_allow_html=True)


# --- CENTRE COLUMN: Trend line chart ---
with col_center:
    st.markdown(
        f'<div class="sanket-card" style="padding: 12px 16px; margin-bottom: 8px;">'
        f'<strong style="font-size: 1.1rem; color: #065f46;">📈 {t("trend_title", lang)}: {current_site_name}</strong>'
        f'</div>',
        unsafe_allow_html=True,
    )

    try:
        raw_trend = api.get_trends(site_id, role)
        df_trend = pd.DataFrame(raw_trend) if not isinstance(raw_trend, pd.DataFrame) else raw_trend
        alert_info = api.get_alert(site_id, role, lang)

        fig = go.Figure()
        x_vals = df_trend["week"] if "week" in df_trend.columns else list(range(1, len(df_trend) + 1))

        # Line 1: Clinic visits (purple)
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

        # Line 2: Absence (orange)
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

        # Line 3: Dust and heat (green)
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

        # Dashed vertical line at alert week
        if alert_info and isinstance(alert_info, dict):
            alert_week = alert_info.get("alert_week", alert_info.get("week"))
            if alert_week is not None and not (isinstance(alert_week, float) and math.isnan(alert_week)):
                fig.add_vline(
                    x=alert_week,
                    line_dash="dash",
                    line_color="#dc2626",
                    line_width=2,
                    annotation_text=f"⚠️ {t('alert_fired', lang)}",
                    annotation_position="top right",
                    annotation_font_color="#dc2626",
                )

        fig.update_layout(
            margin=dict(l=20, r=20, t=30, b=20),
            plot_bgcolor="rgba(255, 255, 255, 0.90)",
            paper_bgcolor="rgba(255, 255, 255, 0.90)",
            height=390,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            xaxis=dict(title=t("week", lang), showgrid=True, gridcolor="#e5e7eb"),
            yaxis=dict(showgrid=True, gridcolor="#e5e7eb"),
        )

        st.plotly_chart(fig, use_container_width=True)
    except Exception as e:
        st.info(f"Trend data unavailable: {e}")


# --- RIGHT COLUMN: Why this alert ---
with col_right:
    st.markdown(
        f'<div class="sanket-card" style="padding: 12px 16px; margin-bottom: 8px;">'
        f'<strong style="font-size: 1.1rem; color: #065f46;">🔍 {t("why_alert_title", lang)}</strong>'
        f'</div>',
        unsafe_allow_html=True,
    )

    try:
        alert_data = api.get_alert(site_id, role, lang)
    except Exception:
        alert_data = None

    if not alert_data:
        st.markdown(
            f'<div class="sanket-card" style="text-align: center; color: #4b5563; padding: 24px;">'
            f'✅ <em>{t("no_alert_for_site", lang)}</em>'
            f'</div>',
            unsafe_allow_html=True,
        )
    else:
        # 1. Contributing signals (signal, change_pct, weeks)
        signals = alert_data.get("contributing_signals", alert_data.get("signals", []))
        if signals:
            st.markdown(f"**{t('contributing_signals', lang)}:**")
            for sig in signals:
                s_name = sig.get("signal", "")
                s_change = sig.get("change_pct", "")
                s_weeks = sig.get("weeks", "")
                st.markdown(
                    f"- **{s_name}**: `{s_change}` ({t('duration', lang)}: {s_weeks})"
                )

        # 2. Evidence list
        evidence_list = alert_data.get("evidence", [])
        if evidence_list:
            st.markdown(f"**{t('evidence', lang)}:**")
            for ev in evidence_list:
                st.markdown(f"• {ev}")

        # 3. Assumptions inside st.expander
        assumptions = alert_data.get("assumptions", [])
        with st.expander(f"📋 {t('assumptions', lang)}", expanded=False):
            if assumptions:
                for asm in assumptions:
                    st.markdown(f"- {asm}")
            else:
                st.caption(t("none", lang))

        # 4. Recommended action and responsible_role
        rec_action = alert_data.get("action", alert_data.get("recommended_action", ""))
        resp_role = alert_data.get("responsible_role", alert_data.get("role", ""))
        if rec_action or resp_role:
            st.markdown(
                f"""
                <div class="sanket-card" style="background-color: #ecfdf5; border-color: #a7f3d0; padding: 12px; margin-top: 8px;">
                    <strong style="color: #065f46;">💡 {t('recommended_action', lang)}:</strong><br/>
                    <span style="font-size: 0.92rem; color: #1f2937;">{rec_action}</span><br/>
                    <small style="color: #047857;"><strong>{t('responsible_role', lang)}:</strong> {resp_role}</small>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # 5. Plain-language summary
        summary_text = alert_data.get("plain_summary", alert_data.get("summary", ""))
        if summary_text:
            st.markdown(
                f"""
                <div class="sanket-card" style="background-color: #fffbeb; border-color: #fde68a; padding: 12px; margin-top: 8px;">
                    <strong style="color: #92400e;">📝 {t('plain_summary', lang)}:</strong><br/>
                    <span style="font-size: 0.9rem; color: #451a03;">{summary_text}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )

st.write("")

# --- BOTTOM ROW: 3 Cards ---
# (1) Data completeness (2) What-if simulation (3) Privacy notice
bot_col1, bot_col2, bot_col3 = st.columns([1, 1, 1], gap="medium")

# Card 1: Data Completeness
with bot_col1:
    st.markdown(
        f'<div class="sanket-card">'
        f'<strong style="color: #065f46; font-size: 1.05rem;">📊 {t("data_completeness", lang)}</strong>',
        unsafe_allow_html=True,
    )
    try:
        # Handle get_completeness signature
        try:
            comp_data = api.get_completeness(site_id, role)
        except TypeError:
            comp_data = api.get_completeness(site_id)

        pct_val = comp_data.get("pct", comp_data.get("percentage", comp_data.get("score", 92)))
        comp_level = comp_data.get("level", comp_data.get("status", "good"))
        missing_wks = comp_data.get("missing_weeks", [])

        if isinstance(missing_wks, list):
            missing_text = ", ".join(str(w) for w in missing_wks) if missing_wks else t("none", lang)
        else:
            missing_text = str(missing_wks) if missing_wks else t("none", lang)

        badge_markup = badge(comp_level)

        st.markdown(
            f"""
            <div style="display: flex; align-items: baseline; gap: 12px; margin-top: 10px; margin-bottom: 8px;">
                <span style="font-size: 2rem; font-weight: 700; color: #111827;">{pct_val}%</span>
                <div>{badge_markup}</div>
            </div>
            <p style="font-size: 0.9rem; color: #4b5563; margin-bottom: 0;">
                <strong>{t("missing_weeks", lang)}:</strong> {missing_text}
            </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    except Exception as e:
        st.markdown(f'<p style="color: #6b7280;">Completeness metric unavailable: {e}</p></div>', unsafe_allow_html=True)


# Card 2: What-if simulation
with bot_col2:
    st.markdown(
        f'<div class="sanket-card">'
        f'<strong style="color: #065f46; font-size: 1.05rem;">🎛️ {t("what_if_title", lang)}</strong>',
        unsafe_allow_html=True,
    )
    dust_delta = st.slider(t("dust_delta", lang), min_value=-30, max_value=50, value=0, step=5, key="slider_dust")
    heat_delta = st.slider(t("heat_delta", lang), min_value=-30, max_value=50, value=0, step=5, key="slider_heat")

    try:
        what_if_res = api.what_if(site_id, dust_delta, heat_delta)
        new_score = what_if_res.get("new_risk_score", what_if_res.get("risk_score", 0))
        new_lvl = what_if_res.get("new_level", what_if_res.get("level", "Normal"))

        lvl_badge = badge(new_lvl)
        st.markdown(
            f"""
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <div>
                    <span style="font-size: 0.85rem; color: #4b5563;">{t('new_risk_score', lang)}:</span><br/>
                    <strong style="font-size: 1.4rem; color: #111827;">{new_score}</strong>
                </div>
                <div>
                    <span style="font-size: 0.85rem; color: #4b5563;">{t('new_level', lang)}:</span><br/>
                    {lvl_badge}
                </div>
            </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    except Exception as e:
        st.markdown(f'<p style="color: #6b7280;">What-if calculation unavailable: {e}</p></div>', unsafe_allow_html=True)


# Card 3: Privacy Notice
with bot_col3:
    st.markdown(
        f'<div class="sanket-card" style="height: 100%; display: flex; flex-direction: column; justify-content: center;">'
        f'<strong style="color: #065f46; font-size: 1.05rem;">🛡️ {t("privacy_rules_title", lang)}</strong>'
        f'<p style="margin-top: 10px; font-size: 0.9rem; color: #374151; line-height: 1.5;">'
        f'{t("privacy_notice", lang)}'
        f'</p>'
        f'<p style="font-size: 0.85rem; color: #047857; margin-bottom: 0;">'
        f'🔒 {t("rule_aggregated", lang)}'
        f'</p>'
        f'</div>',
        unsafe_allow_html=True,
    )
