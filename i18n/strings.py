# i18n/strings.py
# Bilingual strings dictionary (English and Hindi) for Sanket Occupational Health Early Warning.

# Sector specific health hazards and problems
SECTOR_INFO = {
    "en": {
        "waste": {
            "name": "Waste Management",
            "hazards": "Biohazards, sharp waste, toxic fumes, decomposing matter",
            "health_problems": "breathing, eye, skin problems, injuries, infections",
        },
        "farm": {
            "name": "Agriculture / Farm",
            "hazards": "Extreme heat, pesticide exposure, repetitive physical strain",
            "health_problems": "heat illness, pesticide poisoning, chronic kidney disease (heat stress and dehydration)",
        },
        "quarry": {
            "name": "Stone Quarry & Mining",
            "hazards": "Silica rock dust, high-decibel blasting, heavy equipment",
            "health_problems": "silicosis (dust), hearing loss",
        },
        "construction": {
            "name": "Construction",
            "hazards": "Cement dust, heights, excessive noise, heavy machinery, toxic paint",
            "health_problems": "silica dust, noise, falls, heat stress, lead",
        },
        "textile": {
            "name": "Textile & Garment",
            "hazards": "Cotton fibre dust, machine noise, poor ventilation, prolonged sitting",
            "health_problems": "byssinosis (cotton dust), noise, breathing and muscle-bone problems",
        },
    },
    "hi": {
        "waste": {
            "name": "कचरा प्रबंधन",
            "hazards": "जैविक कचरा, नुकीला सामान, जहरीला धुआं, सड़ने वाले पदार्थ",
            "health_problems": "सांस, आंख और त्वचा की समस्याएं, चोटें, संक्रमण",
        },
        "farm": {
            "name": "कृषि / खेती",
            "hazards": "भीषण गर्मी, कीटनाशक संपर्क, भारी शारीरिक मेहनत",
            "health_problems": "गर्मी की बीमारी (हीट इलनेस), कीटनाशक विषाक्तता, क्रोनिक किडनी रोग (गर्मी का तनाव और निर्जलीकरण)",
        },
        "quarry": {
            "name": "पत्थर खदान व खनन",
            "hazards": "सिलिका पत्थर की धूल, तेज धमाके, भारी उपकरण",
            "health_problems": "सिलिकोसिस (धूल से फेफड़े की बीमारी), सुनने में कमी (बहरापन)",
        },
        "construction": {
            "name": "भवन निर्माण",
            "hazards": "सीमेंट व रेत की धूल, ऊंचाई, तेज शोर, भारी मशीनरी, सीसा (लेड)",
            "health_problems": "सिलिका धूल, शोर, गिरना, हीट स्ट्रेस (गर्मी का तनाव), लेड विषाक्तता",
        },
        "textile": {
            "name": "कपड़ा और वस्त्र उद्योग",
            "hazards": "कपास के रेशे व बारीक धूल, करघों का तेज शोर, खराब हवा",
            "health_problems": "बिसिनोसिस (कपास की धूल), शोर, सांस और मांसपेशियों-हड्डियों की समस्याएं",
        },
    },
}

# Main application labels in English and handwritten Hindi (Devanagari)
STRINGS = {
    "en": {
        # App branding & Navigation
        "app_name": "Sanket",
        "app_symbol": "⚕️",
        "symbol_name": "Rod of Asclepius (Arogya / Healthcare Symbol)",
        "app_subtitle": "Occupational Health Early Warning System",
        "nav_dashboard": "Dashboard",
        "nav_backtest": "Back-test",
        "nav_about": "About & Privacy",
        
        # Privacy & Disclaimer
        "privacy_notice": "Aggregated data only. Not for individual employment or disciplinary use.",
        "tool_disclaimer": "This tool does not diagnose. It only warns about rising patterns.",
        "simulated_data_note": "Results are on simulated data.",
        "demo_signup_notice": "Demo only. No real account is created.",
        
        # Landing page story lines
        "landing_line_1": "Workers in farm, quarry, construction, textile and waste work face slow hazards (heat, dust, chemicals, noise).",
        "landing_line_2": "Early signs of illness are often ignored or recognized too late.",
        "landing_line_3": "Sanket joins clinic visits, sickness absence and environment data to warn early.",
        "landing_line_4": "It flags groups (sites), never individuals.",
        "landing_line_5": "All data is simulated for research and demonstration.",
        
        # Actions & Auth
        "sign_in": "Sign in",
        "sign_up": "Sign up",
        "continue_btn": "Continue",
        "open_dashboard": "Open dashboard",
        "download_report": "Download report",
        "select_role": "Select Role",
        
        # Roles
        "role_health_officer": "Health officer",
        "role_inspector": "Inspector",
        "role_public": "Public",
        
        # Sectors / Occupations
        "sector_all": "All",
        "sector_farm": "Farm",
        "sector_quarry": "Quarry",
        "sector_construction": "Construction",
        "sector_waste": "Waste",
        "sector_textile": "Textile",
        
        # Dashboard column headings & labels
        "sites_title": "Sites",
        "trend_title": "Trend",
        "why_alert_title": "Why this alert",
        "contributing_signals": "Contributing signals",
        "evidence": "Evidence",
        "assumptions": "Assumptions",
        "recommended_action": "Recommended action",
        "responsible_role": "Responsible role",
        "plain_summary": "Plain-language summary",
        "no_alert_for_site": "No alert for this site",
        "alert_fired": "alert fired",
        
        # Risk & levels
        "risk": "Risk",
        "hidden_risk": "hidden (<5)",
        "level_normal": "Normal",
        "level_watch": "Watch",
        "level_high": "High",
        
        # Signal lines
        "signal_clinic": "Clinic visits",
        "signal_absence": "Sickness absence",
        "signal_environment": "Dust & Heat",
        "week": "Week",
        "signal": "Signal",
        "change_pct": "Change",
        "duration": "Duration",
        
        # Bottom row cards
        "data_completeness": "Data completeness",
        "missing_weeks": "Missing weeks",
        "none": "None",
        "what_if_title": "What-if simulation",
        "dust_delta": "Dust change (%)",
        "heat_delta": "Heat change (%)",
        "new_risk_score": "New risk score",
        "new_level": "New level",
        
        # Back-test labels
        "backtest_title": "Model Back-test Evaluation",
        "lead_time_weeks": "Lead time (weeks)",
        "sensitivity": "Sensitivity",
        "ppv": "Positive Predictive Value (PPV)",
        "false_alarms": "False alarms",
        "scenarios_evaluated": "Scenarios evaluated",
        "data_latency_note": "Data latency note",
        "missing_data_behavior": "Missing data handling",
        
        # About / Privacy page labels
        "about_title": "About Sanket & Privacy Safeguards",
        "privacy_rules_title": "Core Privacy Rules",
        "rule_aggregated": "Aggregated data only: Patterns are analyzed strictly at the site/group level.",
        "rule_small_counts": "Small count suppression: Groups with fewer than 5 individuals are hidden (<5).",
        "rule_role_views": "Role-based views: Granular environment and absence metrics are partitioned by role.",
        "rule_non_punitive": "Not for individual employment or disciplinary use: Designed solely for occupational preventive health.",
        "rule_simulated": "All data is simulated: Protects actual workforce privacy while testing detection workflows.",
        "table_occ_health": "Common health problems by occupation",
        "col_occupation": "Occupation / Industry",
        "col_hazards": "Slow Hazards",
        "col_health_problems": "Common Health Problems",
    },
    "hi": {
        # App branding & Navigation
        "app_name": "संकेत",
        "app_symbol": "⚕️",
        "symbol_name": "आरोग्य / चिकित्सा प्रतीक (Rod of Asclepius)",
        "app_subtitle": "व्यावसायिक स्वास्थ्य पूर्व चेतावनी प्रणाली",
        "nav_dashboard": "डैशबोर्ड",
        "nav_backtest": "बैक-टेस्ट",
        "nav_about": "बारे में और गोपनीयता",
        
        # Privacy & Disclaimer
        "privacy_notice": "केवल संकलित (एग्रीगेटेड) डेटा। व्यक्तिगत रोजगार या अनुशासनात्मक उपयोग के लिए नहीं।",
        "tool_disclaimer": "यह उपकरण निदान नहीं करता। यह केवल बढ़ते पैटर्न की चेतावनी देता है।",
        "simulated_data_note": "परिणाम सिम्युलेटेड डेटा पर आधारित हैं।",
        "demo_signup_notice": "केवल डेमो। कोई वास्तविक खाता नहीं बनाया जाता है।",
        
        # Landing page story lines
        "landing_line_1": "खेती, खदान, निर्माण, कपड़ा और कचरा कामगार धीमे खतरों (गर्मी, धूल, रसायन, शोर) का सामना करते हैं।",
        "landing_line_2": "बीमारी के शुरुआती संकेतों को अक्सर अनदेखा किया जाता है या बहुत देर से समझा जाता है।",
        "landing_line_3": "संकेत क्लिनिक विज़िट, बीमारी की अनुपस्थिति और पर्यावरण डेटा को जोड़कर समय रहते चेतावनी देता है।",
        "landing_line_4": "यह केवल समूहों (कार्यस्थलों) को चिन्हित करता है, किसी व्यक्ति को कभी नहीं।",
        "landing_line_5": "प्रदर्शित सभी डेटा केवल अनुसंधान और प्रदर्शन के लिए सिम्युलेटेड है।",
        
        # Actions & Auth
        "sign_in": "साइन इन",
        "sign_up": "साइन अप",
        "continue_btn": "जारी रखें",
        "open_dashboard": "डैशबोर्ड खोलें",
        "download_report": "रिपोर्ट डाउनलोड करें",
        "select_role": "भूमिका चुनें",
        
        # Roles
        "role_health_officer": "स्वास्थ्य अधिकारी",
        "role_inspector": "श्रम निरीक्षक",
        "role_public": "नागरिक (सार्वजनिक)",
        
        # Sectors / Occupations
        "sector_all": "सभी",
        "sector_farm": "खेती",
        "sector_quarry": "खदान",
        "sector_construction": "निर्माण",
        "sector_waste": "कचरा",
        "sector_textile": "कपड़ा",
        
        # Dashboard column headings & labels
        "sites_title": "कार्यस्थल",
        "trend_title": "रुझान",
        "why_alert_title": "यह चेतावनी क्यों?",
        "contributing_signals": "योगदानकर्ता संकेत",
        "evidence": "साक्ष्य",
        "assumptions": "मान्यताएं",
        "recommended_action": "सुझाई गई कार्रवाई",
        "responsible_role": "जिम्मेदार भूमिका",
        "plain_summary": "सरल भाषा में सारांश",
        "no_alert_for_site": "इस स्थल के लिए कोई चेतावनी नहीं",
        "alert_fired": "चेतावनी जारी",
        
        # Risk & levels
        "risk": "जोखिम",
        "hidden_risk": "छिपा हुआ (<5)",
        "level_normal": "सामान्य",
        "level_watch": "निगरानी",
        "level_high": "उच्च",
        
        # Signal lines
        "signal_clinic": "क्लिनिक विज़िट",
        "signal_absence": "बीमारी से अनुपस्थिति",
        "signal_environment": "धूल और गर्मी",
        "week": "सप्ताह",
        "signal": "संकेत",
        "change_pct": "परिवर्तन",
        "duration": "अवधि",
        
        # Bottom row cards
        "data_completeness": "डेटा पूर्णता",
        "missing_weeks": "लापता सप्ताह",
        "none": "कोई नहीं",
        "what_if_title": "संभावित परिदृश्य (What-if)",
        "dust_delta": "धूल परिवर्तन (%)",
        "heat_delta": "गर्मी परिवर्तन (%)",
        "new_risk_score": "नया जोखिम स्कोर",
        "new_level": "नया स्तर",
        
        # Back-test labels
        "backtest_title": "मॉडल बैक-टेस्ट मूल्यांकन",
        "lead_time_weeks": "लीड समय (सप्ताह)",
        "sensitivity": "संवेदनशीलता",
        "ppv": "सकारात्मक पूर्वानुमान मूल्य (PPV)",
        "false_alarms": "गलत अलार्म",
        "scenarios_evaluated": "परीक्षित परिदृश्य",
        "data_latency_note": "डेटा विलंबता नोट",
        "missing_data_behavior": "लापता डेटा प्रबंधन",
        
        # About / Privacy page labels
        "about_title": "संकेत और डेटा सुरक्षा के बारे में",
        "privacy_rules_title": "प्रमुख गोपनीयता नियम",
        "rule_aggregated": "केवल संकलित डेटा: पैटर्न का विश्लेषण केवल कार्यस्थल/समूह स्तर पर किया जाता है।",
        "rule_small_counts": "कम संख्या का छिपाव: 5 से कम व्यक्तियों वाले समूहों को छुपाया जाता है (<5)।",
        "rule_role_views": "भूमिका-आधारित दृश्य: भूमिका के अनुसार पर्यावरण और अनुपस्थिति मेट्रिक्स नियंत्रित होते हैं।",
        "rule_non_punitive": "रोजगार या अनुशासनात्मक उपयोग के लिए नहीं: केवल निवारक व्यावसायिक स्वास्थ्य सुरक्षा के लिए।",
        "rule_simulated": "सभी डेटा सिम्युलेटेड है: कर्मचारियों की वास्तविक निजता सुरक्षित रखते हुए परीक्षण।",
        "table_occ_health": "व्यवसाय के अनुसार आम स्वास्थ्य समस्याएं",
        "col_occupation": "व्यवसाय / उद्योग",
        "col_hazards": "धीमे खतरे",
        "col_health_problems": "आम स्वास्थ्य समस्याएं",
    },
}

def t(key: str, lang: str = "en") -> str:
    """
    Fetch localized string for key.
    Falls back to English if Hindi translation is missing,
    and returns key itself if key is not found in either.
    """
    lang_key = lang if lang in STRINGS else "en"
    val = STRINGS[lang_key].get(key)
    if val is not None:
        return val
    # Fallback to English
    val_en = STRINGS["en"].get(key)
    if val_en is not None:
        return val_en
    return key


if __name__ == "__main__":
    print(f"Total keys defined in EN: {len(STRINGS['en'])}")
    print(f"Total keys defined in HI: {len(STRINGS['hi'])}\n")
    print("--- Printing every key in EN and HI ---")
    for k in STRINGS["en"].keys():
        en_str = t(k, "en")
        hi_str = t(k, "hi")
        print(f"[{k}]")
        print(f"   EN: {en_str}")
        print(f"   HI: {hi_str}")
