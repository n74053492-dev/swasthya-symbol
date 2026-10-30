import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    app_title: 'Swasthya Symbol',
    app_full_name: 'Occupational Health Early Warning System',
    app_symbol_name: 'Rod of Asclepius (Arogya / Healthcare Symbol)',
    tagline: 'Population-level surveillance & early hazard detection across work sites',
    current_date: 'Current Date',
    select_role: 'Select Role',
    active_role: 'Active Role',
    lang_toggle: 'हिंदी (Hindi)',

    // Roles
    role_health_officer: 'Health Officer',
    role_inspector: 'Inspector',
    role_public: 'Public Viewer',
    role_health_officer_desc: 'Full clinical surveillance, diagnostic triage, action plans & reports',
    role_inspector_desc: 'Environmental exposure trends, site inspection recommendations & mitigation',
    role_public_desc: 'High-level regional risk aggregates with protected site privacy',

    // Navigation
    nav_overview: 'Overview Dashboard',
    nav_surveillance: 'Site Surveillance',
    nav_alerts: 'Alerts & Explanations',
    nav_risk_analysis: 'Risk Analysis',
    nav_backtesting: 'Back-testing & Performance',
    nav_what_if: 'What-if Simulation',
    nav_reports: 'Reports',
    nav_about: 'About & Privacy',

    // KPI Cards
    kpi_monitored_sites: 'Total Monitored Sites',
    kpi_active_alerts: 'Active Alerts',
    kpi_high_risk_sites: 'High / Critical Risk Sites',
    kpi_data_completeness: 'Avg. Data Completeness',
    kpi_target_population: 'Surveillance Cohort (Approx.)',

    // Risk Levels
    risk_level: 'Risk Level',
    risk_score: 'Combined Risk Score',
    risk_low: 'Low',
    risk_moderate: 'Moderate',
    risk_high: 'High',
    risk_critical: 'Critical',

    // Surveillance Signals
    signals_heading: 'Core Surveillance Signals',
    clinic_visits: 'Clinic Visits',
    sickness_absence: 'Sickness Absence',
    environment: 'Environmental Exposure',
    heat_exposure: 'Heat Exposure (Index °C)',
    dust_exposure: 'Dust Concentration (PM10 µg/m³)',
    baseline: 'Baseline',
    current_value: 'Current Value',
    percentage_change: 'Change vs Baseline',
    detection_status: 'Detection Status',
    threshold_breach: 'Threshold Breach',

    // Data Quality & Completeness
    data_completeness: 'Data Completeness',
    completeness_complete: 'Complete (90-100%)',
    completeness_partial: 'Partial (70-89%)',
    completeness_incomplete: 'Incomplete (<70%)',
    missing_data: 'Missing Data',
    insufficient_data: 'Insufficient Data',
    missing_signal_warning: 'Re-weighted without missing signal',

    // Filters & Actions
    filter_all: 'All',
    filter_site: 'Work Site',
    filter_occupation: 'Occupation / Sector',
    filter_risk: 'Risk Level',
    filter_period: 'Time Period',
    filter_algorithm: 'Detection Algorithm',
    filter_apply: 'Apply Filters',
    filter_reset: 'Reset Filters',
    search_placeholder: 'Search site or sector...',
    view_details: 'View Details',
    download_report: 'Download PDF Report',
    close: 'Close',
    export_csv: 'Export Aggregated CSV',

    // Occupations
    occ_agriculture: 'Agriculture',
    occ_quarry: 'Quarry and Mining',
    occ_waste: 'Waste Management',
    occ_textile: 'Textile',
    occ_construction: 'Construction',

    // Alerts Panel
    alert_id: 'Alert ID',
    week_detected: 'Week Detected',
    detection_algorithm: 'Detection Algorithm',
    primary_signal: 'Primary Driver',
    contributing_signals: 'Contributing Signals',
    why_this_alert: 'Why Was This Alert Triggered?',
    plain_summary: 'Plain-Language Summary',
    recommendations: 'Recommended Preventive Actions',
    responsible_role: 'Responsible Role',
    priority: 'Priority',
    timeframe: 'Timeframe',
    supporting_evidence: 'Supporting Evidence',
    confidence_notes: 'Data Quality & Surveillance Limitations',

    // Back-testing
    backtesting_title: 'Model Evaluation & Back-Testing',
    backtesting_subtitle: 'Retrospective validation against 26 weeks of synthetic historical health surges',
    lead_time: 'Lead Time (Weeks)',
    lead_time_def: 'Average advance warning time between first generated alert and reference health surge event.',
    sensitivity: 'Sensitivity (Recall)',
    sensitivity_def: 'Proportion of true historical reference surge events correctly detected by the model.',
    ppv: 'Positive Predictive Value (PPV)',
    ppv_def: 'Proportion of generated alerts that correspond to true reference health surges.',
    false_alarm_rate: 'False Alarm Rate',
    false_alarm_def: 'Frequency of generated alerts that do not correspond to reference health surges.',
    detected_events: 'Detected Surges',
    missed_events: 'Missed Surges',
    confusion_matrix: 'Confusion Matrix Analysis',
    synthetic_backtest_disclaimer: 'Note: Results are derived from synthetic historical benchmark datasets for demonstration.',

    // What-if Simulation
    what_if_title: 'Interactive What-if Scenario Simulation',
    what_if_desc: 'Adjust environmental stressors to simulate projected changes in environmental risk, combined risk score, and alert classification.',
    slider_heat: 'Simulated Heat Exposure Adjustment (% change)',
    slider_dust: 'Simulated Dust Concentration Adjustment (% change)',
    baseline_vs_simulated: 'Baseline vs. Simulated Outcome',
    reset_simulation: 'Reset Simulation',
    simulation_disclaimer: 'Hypothetical simulation for operational planning purposes only, not a clinical forecast of worker health outcomes.',

    // Privacy & Small-cell
    small_cell_notice: '<5 (Small cell suppressed)',
    privacy_notice_short: 'Aggregated data only. Small counts (<5) suppressed. Not for individual diagnosis or employment decisions.',
    privacy_notice_full: 'Privacy Notice: This dashboard displays aggregated occupational health surveillance information only. Small counts below 5 are suppressed to ensure worker privacy. This system is intended for population-level early warning and must not be used for individual worker diagnosis, identification, disciplinary actions, or employment decisions.',

    // Table Headers
    col_site: 'Site Name',
    col_occupation: 'Occupation',
    col_clinic: 'Clinic Visits',
    col_absence: 'Sickness Absence',
    col_environment: 'Environment',
    col_risk_score: 'Risk Score',
    col_risk_level: 'Risk Level',
    col_trend: '8-Wk Trend',
    col_completeness: 'Data Quality',
    col_actions: 'Actions',
  },

  hi: {
    // Brand & Header
    app_title: 'स्वास्थ्य सिंबल (Swasthya Symbol)',
    app_full_name: 'व्यावसायिक स्वास्थ्य पूर्व चेतावनी प्रणाली',
    app_symbol_name: 'आरोग्य / चिकित्सा प्रतीक (Rod of Asclepius)',
    tagline: 'कार्यस्थलों पर जनस्वास्थ्य निगरानी एवं प्रारंभिक जोखिम पहचान प्रणाली',
    current_date: 'वर्तमान दिनांक',
    select_role: 'भूमिका चुनें',
    active_role: 'सक्रिय भूमिका',
    lang_toggle: 'English (अंग्रेज़ी)',

    // Roles
    role_health_officer: 'स्वास्थ्य अधिकारी (Health Officer)',
    role_inspector: 'श्रम एवं सुरक्षा निरीक्षक (Inspector)',
    role_public: 'सार्वजनिक दर्शक (Public Viewer)',
    role_health_officer_desc: 'पूर्ण निगरानी, नैदानिक समीक्षा, कार्ययोजना एवं विस्तृत रिपोर्ट',
    role_inspector_desc: 'पर्यावरणीय जोखिम रुझान, साइट निरीक्षण अनुशंसाएं एवं शमन',
    role_public_desc: 'गोपनीयता संरक्षित क्षेत्रीय समग्र जोखिम आंकड़े',

    // Navigation
    nav_overview: 'अवलोकन डैशबोर्ड',
    nav_surveillance: 'कार्यस्थल निगरानी',
    nav_alerts: 'चेतावनियां एवं स्पष्टीकरण',
    nav_risk_analysis: 'जोखिम विश्लेषण',
    nav_backtesting: 'बैक-टेस्टिंग एवं प्रदर्शन',
    nav_what_if: 'व्हाट-इफ परिदृश्य सिमुलेशन',
    nav_reports: 'रिपोर्ट डाउनलोड',
    nav_about: 'के बारे में एवं गोपनीयता',

    // KPI Cards
    kpi_monitored_sites: 'कुल निगरानी स्थल',
    kpi_active_alerts: 'सक्रिय चेतावनियां',
    kpi_high_risk_sites: 'उच्च / गंभीर जोखिम स्थल',
    kpi_data_completeness: 'औसत डेटा पूर्णता',
    kpi_target_population: 'निगरानी कार्यबल (लगभग)',

    // Risk Levels
    risk_level: 'जोखिम स्तर',
    risk_score: 'संयुक्त जोखिम स्कोर',
    risk_low: 'निम्न (Low)',
    risk_moderate: 'मध्यम (Moderate)',
    risk_high: 'उच्च (High)',
    risk_critical: 'अति-गंभीर (Critical)',

    // Surveillance Signals
    signals_heading: 'प्रमुख निगरानी संकेत',
    clinic_visits: 'क्लिनिक विज़िट',
    sickness_absence: 'बीमारी से अनुपस्थिति',
    environment: 'पर्यावरणीय जोखिम',
    heat_exposure: 'गर्मी का प्रभाव (हीट इंडेक्स °C)',
    dust_exposure: 'धूल सांद्रता (PM10 µg/m³)',
    baseline: 'ऐतिहासिक आधार (बेसलाइन)',
    current_value: 'वर्तमान मान',
    percentage_change: 'बेसलाइन से परिवर्तन',
    detection_status: 'पहचान स्थिति',
    threshold_breach: 'सीमा उल्लंघन',

    // Data Quality & Completeness
    data_completeness: 'डेटा पूर्णता',
    completeness_complete: 'पूर्ण (90-100%)',
    completeness_partial: 'आंशिक (70-89%)',
    completeness_incomplete: 'अपूर्ण (<70%)',
    missing_data: 'लापता डेटा',
    insufficient_data: 'अपर्याप्त डेटा',
    missing_signal_warning: 'लापता सिग्नल के बिना पुनर्गठित भार',

    // Filters & Actions
    filter_all: 'सभी',
    filter_site: 'कार्यस्थल',
    filter_occupation: 'व्यवसाय / क्षेत्र',
    filter_risk: 'जोखिम स्तर',
    filter_period: 'समय अवधि',
    filter_algorithm: 'पहचान एल्गोरिदम',
    filter_apply: 'फ़िल्टर लागू करें',
    filter_reset: 'रीसेट करें',
    search_placeholder: 'कार्यस्थल या व्यवसाय खोजें...',
    view_details: 'विवरण देखें',
    download_report: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    close: 'बंद करें',
    export_csv: 'सीएसवी निर्यात करें',

    // Occupations
    occ_agriculture: 'कृषि एवं संबद्ध कार्य',
    occ_quarry: 'खदान एवं पत्थर खनन',
    occ_waste: 'कचरा एवं अपशिष्ट प्रबंधन',
    occ_textile: 'वस्त्र एवं कपड़ा उद्योग',
    occ_construction: 'भवन एवं अवसंरचना निर्माण',

    // Alerts Panel
    alert_id: 'अलर्ट क्रमांक',
    week_detected: 'पहचान का सप्ताह',
    detection_algorithm: 'पहचान एल्गोरिदम',
    primary_signal: 'प्रमुख प्रेरक संकेत',
    contributing_signals: 'योगदान देने वाले संकेत',
    why_this_alert: 'यह चेतावनी क्यों जारी की गई?',
    plain_summary: 'सरल भाषा में सारांश',
    recommendations: 'अनुशंसित निवारक कार्रवाइयां',
    responsible_role: 'जिम्मेदार भूमिका',
    priority: 'प्राथमिकता',
    timeframe: 'समय-सीमा',
    supporting_evidence: 'समर्थक साक्ष्य',
    confidence_notes: 'डेटा गुणवत्ता व सीमाएं',

    // Back-testing
    backtesting_title: 'मॉडल मूल्यांकन एवं बैक-टेस्टिंग',
    backtesting_subtitle: '26 सप्ताह के ऐतिहासिक स्वास्थ्य वृद्धि परिदृश्यों पर परीक्षण',
    lead_time: 'लीड टाइम (सप्ताह)',
    lead_time_def: 'अलर्ट जारी होने और वास्तविक स्वास्थ्य घटना के बीच का औसत अग्रिम समय।',
    sensitivity: 'संवेदनशीलता (Sensitivity)',
    sensitivity_def: 'मॉडल द्वारा सही ढंग से पहचानी गई वास्तविक स्वास्थ्य घटनाओं का अनुपात।',
    ppv: 'सकारात्मक पूर्वानुमान मूल्य (PPV)',
    ppv_def: 'जारी किए गए अलर्ट्स का वह अनुपात जो वास्तविक घटनाओं से मेल खाता है।',
    false_alarm_rate: 'गलत अलार्म दर',
    false_alarm_def: 'उन अलर्ट्स की आवृत्ति जो किसी वास्तविक घटना से संबंधित नहीं थे।',
    detected_events: 'सफलतापूर्वक पहचानी गई घटनाएं',
    missed_events: 'छूटी हुई घटनाएं',
    confusion_matrix: 'कन्फ्यूजन मैट्रिक्स विश्लेषण',
    synthetic_backtest_disclaimer: 'नोट: परिणाम केवल तकनीकी प्रदर्शन हेतु सिम्युलेटेड ऐतिहासिक डेटा पर आधारित हैं।',

    // What-if Simulation
    what_if_title: 'इंटरएक्टिव व्हाट-इफ परिदृश्य सिमुलेशन',
    what_if_desc: 'पर्यावरणीय कारकों को बदलकर जोखिम स्कोर और अलर्ट स्तर में संभावित बदलाव का अध्ययन करें।',
    slider_heat: 'सिम्युलेटेड गर्मी समायोजन (% बदलाव)',
    slider_dust: 'सिम्युलेटेड धूल सांद्रता समायोजन (% बदलाव)',
    baseline_vs_simulated: 'बेसलाइन बनाम सिम्युलेटेड परिणाम',
    reset_simulation: 'सिमुलेशन रीसेट करें',
    simulation_disclaimer: 'यह केवल परिचालन योजना के लिए एक काल्पनिक सिमुलेशन है, श्रमिकों के स्वास्थ्य का निश्चित पूर्वानुमान नहीं।',

    // Privacy & Small-cell
    small_cell_notice: '<5 (गोपनीयता हेतु छिपाया गया)',
    privacy_notice_short: 'केवल संकलित डेटा। छोटी संख्याएं (<5) गोपनीय हैं। व्यक्तिगत निदान या रोजगार निर्णयों के लिए निषिद्ध।',
    privacy_notice_full: 'गोपनीयता सूचना: यह डैशबोर्ड केवल संकलित (एग्रीगेटेड) व्यावसायिक स्वास्थ्य निगरानी डेटा प्रदर्शित करता है। व्यक्तिगत पहचान सुरक्षित रखने के लिए 5 से कम संख्याएं छिपाई जाती हैं। यह प्रणाली जनसंख्या स्तर पर पूर्व चेतावनी के लिए है और इसका उपयोग व्यक्तिगत कर्मचारी निदान या रोजगार निर्णयों के लिए नहीं किया जाना चाहिए।',

    // Table Headers
    col_site: 'कार्यस्थल का नाम',
    col_occupation: 'व्यवसाय',
    col_clinic: 'क्लिनिक विज़िट',
    col_absence: 'बीमारी अनुपस्थिति',
    col_environment: 'पर्यावरण',
    col_risk_score: 'जोखिम स्कोर',
    col_risk_level: 'जोखिम स्तर',
    col_trend: '8-सप्ताह रुझान',
    col_completeness: 'डेटा गुणवत्ता',
    col_actions: 'कार्रवाई',
  },
};

export const useTranslation = (lang: Language) => {
  return (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };
};
