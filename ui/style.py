# ui/style.py
# UI styling, custom CSS injection, top navigation bar, badges, and privacy notices.

import streamlit as st
from i18n.strings import t


def apply_style():
    """Injects custom CSS styling according to design specs."""
    st.markdown(
        """
        <style>
        /* Gradient background for whole app */
        .stApp {
            background: linear-gradient(90deg, #47C8B0 0%, #F7FDB4 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
            color: #1f2937;
        }

        /* 90% opacity white cards with 16px radius, soft shadow, 16px padding */
        .sanket-card {
            background-color: rgba(255, 255, 255, 0.90);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 16px;
            margin-bottom: 16px;
            border: 1px solid rgba(255, 255, 255, 0.7);
        }

        /* Streamlit metric card overrides */
        div[data-testid="stMetric"] {
            background-color: rgba(255, 255, 255, 0.90);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.7);
        }

        /* Level Badge Styles */
        .badge-normal {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.82rem;
            display: inline-block;
        }

        .badge-watch {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fcd34d;
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.82rem;
            display: inline-block;
        }

        .badge-high {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.82rem;
            display: inline-block;
        }

        /* Privacy banner */
        .privacy-box {
            background-color: rgba(255, 255, 255, 0.90);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 14px 18px;
            border-left: 5px solid #47C8B0;
            font-size: 0.875rem;
            color: #374151;
            margin-top: 12px;
            margin-bottom: 12px;
        }

        /* Topbar container */
        .topbar-wrapper {
            background-color: rgba(255, 255, 255, 0.92);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 12px 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Interactive site list buttons */
        div.stButton > button {
            border-radius: 12px;
            transition: all 0.2s ease-in-out;
        }
        div.stButton > button:hover {
            border-color: #47C8B0;
            box-shadow: 0 2px 8px rgba(71, 200, 176, 0.3);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def badge(level: str) -> str:
    """
    Returns HTML string for level badges:
    Normal (green), Watch (amber), High (red).
    """
    raw_lvl = str(level).strip().lower() if level else "normal"
    if "high" in raw_lvl or "poor" in raw_lvl:
        cls_name = "badge-high"
        display_text = "High" if "high" in raw_lvl else "Poor"
    elif "watch" in raw_lvl or "partial" in raw_lvl or "amber" in raw_lvl:
        cls_name = "badge-watch"
        display_text = "Watch" if "watch" in raw_lvl else "Partial"
    else:
        cls_name = "badge-normal"
        display_text = "Normal" if "normal" in raw_lvl else "Good"

    return f'<span class="{cls_name}">{display_text}</span>'


def privacy_notice():
    """Displays the privacy notice banner in the active language."""
    lang = st.session_state.get("lang", "en")
    notice_text = t("privacy_notice", lang)
    st.markdown(
        f'<div class="privacy-box">🛡️ <strong>{t("privacy_notice", lang)}</strong></div>',
        unsafe_allow_html=True,
    )


def topbar(page_name: str = "Dashboard"):
    """
    Renders top navigation bar with:
    - App title + navigation links (Dashboard, Back-test, About)
    - Role selector
    - Language toggle (EN | हि)
    """
    lang = st.session_state.get("lang", "en")
    current_role = st.session_state.get("role", "public")

    # Card container for top navigation
    with st.container():
        cols = st.columns([2.5, 3.2, 1.8, 1.2])

        # Left: App Brand & Symbol
        with cols[0]:
            st.markdown(
                f"""
                <div style="display: flex; align-items: center; gap: 8px; padding-top: 4px;">
                    <span style="font-size: 1.8rem;" title="{t('symbol_name', lang)}" aria-label="{t('symbol_name', lang)}">⚕️</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: #0f766e; letter-spacing: -0.5px;">
                        {t("app_name", lang)}
                    </span>
                    <span style="font-size: 0.85rem; color: #4b5563; padding-left: 6px; border-left: 2px solid #cbd5e1;">
                        {t("app_subtitle", lang)}
                    </span>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Center: Page navigation links
        with cols[1]:
            nav_cols = st.columns(3)
            with nav_cols[0]:
                is_dash = (page_name == "Dashboard")
                if st.button(
                    f"{'👉 ' if is_dash else ''}{t('nav_dashboard', lang)}",
                    key="topbar_nav_dash",
                    use_container_width=True,
                    type="primary" if is_dash else "secondary",
                ):
                    st.switch_page("pages/1_Dashboard.py")

            with nav_cols[1]:
                is_back = (page_name == "Back-test")
                if st.button(
                    f"{'👉 ' if is_back else ''}{t('nav_backtest', lang)}",
                    key="topbar_nav_backtest",
                    use_container_width=True,
                    type="primary" if is_back else "secondary",
                ):
                    st.switch_page("pages/2_Back-test.py")

            with nav_cols[2]:
                is_about = (page_name == "About")
                if st.button(
                    f"{'👉 ' if is_about else ''}{t('nav_about', lang)}",
                    key="topbar_nav_about",
                    use_container_width=True,
                    type="primary" if is_about else "secondary",
                ):
                    st.switch_page("pages/3_About_Privacy.py")

        # Right-Center: Role dropdown
        with cols[2]:
            role_options = ["health_officer", "inspector", "public"]
            role_labels = {
                "health_officer": t("role_health_officer", lang),
                "inspector": t("role_inspector", lang),
                "public": t("role_public", lang),
            }
            try:
                curr_idx = role_options.index(current_role)
            except ValueError:
                curr_idx = 2

            selected_role = st.selectbox(
                label=t("select_role", lang),
                options=role_options,
                index=curr_idx,
                format_func=lambda x: role_labels.get(x, x),
                key="topbar_role_select",
                label_visibility="collapsed",
            )
            if selected_role != current_role:
                st.session_state.role = selected_role
                st.rerun()

        # Far-Right: Language toggle EN | हि
        with cols[3]:
            lang_label = "हि (Hindi)" if lang == "en" else "EN (English)"
            if st.button(lang_label, key="topbar_lang_toggle", use_container_width=True):
                st.session_state.lang = "hi" if lang == "en" else "en"
                st.rerun()
