import { Alert, BacktestMetrics, Occupation, Site, WeeklyObservation } from '../types';

// Helper to generate realistic weekly observation sequence
function createObservationSeries(
  baseClinic: number,
  baseAbsence: number,
  baseHeat: number,
  baseDust: number,
  options: {
    surgeWeekStart?: number;
    surgeDuration?: number;
    clinicMultiplier?: number;
    absenceMultiplier?: number;
    heatMultiplier?: number;
    dustMultiplier?: number;
    missingClinicWeeks?: number[];
    missingEnvWeeks?: number[];
    incidentWeeks?: number[];
    smallCellWeeks?: number[];
  } = {}
): WeeklyObservation[] {
  const observations: WeeklyObservation[] = [];
  const {
    surgeWeekStart = 99,
    surgeDuration = 4,
    clinicMultiplier = 1.0,
    absenceMultiplier = 1.0,
    heatMultiplier = 1.0,
    dustMultiplier = 1.0,
    missingClinicWeeks = [],
    missingEnvWeeks = [],
    incidentWeeks = [],
    smallCellWeeks = [],
  } = options;

  for (let w = 1; w <= 26; w++) {
    const isSurge = w >= surgeWeekStart && w < surgeWeekStart + surgeDuration;
    const isIncident = incidentWeeks.includes(w);

    // Date range string calculation
    const startDay = ((w - 1) * 7) % 28 + 1;
    const month = Math.floor((w - 1) / 4) + 5; // May to October
    const monthNames = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthName = monthNames[Math.min(month - 5, monthNames.length - 1)];
    const dateRange = `${monthName} W${w}`;

    // Clinic visits calculation
    let clinicVisits: number | null = Math.max(
      2,
      Math.round(baseClinic + Math.sin(w * 0.8) * (baseClinic * 0.15))
    );
    if (isSurge) {
      clinicVisits = Math.round(clinicVisits * clinicMultiplier);
    }
    if (smallCellWeeks.includes(w)) {
      clinicVisits = 3; // between 1 and 4 -> will be suppressed by small-cell rules
    }
    if (missingClinicWeeks.includes(w)) {
      clinicVisits = null;
    }

    const clinicChangePct =
      clinicVisits !== null ? Math.round(((clinicVisits - baseClinic) / baseClinic) * 100) : null;
    const clinicAlert = clinicChangePct !== null && clinicChangePct >= 30;

    // Sickness absence percentage
    let absenceRate: number | null = Math.max(
      2.0,
      Math.round((baseAbsence + Math.cos(w * 0.5) * 1.2) * 10) / 10
    );
    if (isSurge) {
      absenceRate = Math.round(absenceRate * absenceMultiplier * 10) / 10;
    }
    const absenceChangePct =
      absenceRate !== null ? Math.round(((absenceRate - baseAbsence) / baseAbsence) * 100) : null;
    const absenceAlert = absenceChangePct !== null && absenceChangePct >= 35;

    // Environmental readings
    let heatIndex: number | null = Math.round((baseHeat + Math.sin(w * 0.3) * 5) * 10) / 10;
    let dustConcentration: number | null = Math.round(baseDust + Math.cos(w * 0.6) * 18);

    if (isSurge) {
      heatIndex = Math.round(heatIndex * heatMultiplier * 10) / 10;
      dustConcentration = Math.round(dustConcentration * dustMultiplier);
    }

    if (missingEnvWeeks.includes(w)) {
      heatIndex = null;
      dustConcentration = null;
    }

    const heatThreshold = 40.0; // °C
    const dustThreshold = 150.0; // µg/m³
    const heatAlert = heatIndex !== null && heatIndex >= heatThreshold;
    const dustAlert = dustConcentration !== null && dustConcentration >= dustThreshold;

    // Simulated statistical EWMA and CUSUM score
    const ewmaScore = Math.min(
      100,
      Math.round(
        (isSurge ? 65 : 20) + Math.sin(w) * 8 + (clinicChangePct ? clinicChangePct * 0.25 : 0)
      )
    );
    const cusumScore = Math.min(
      100,
      Math.round(
        (isSurge ? 75 : 15) + (absenceChangePct ? absenceChangePct * 0.3 : 0)
      )
    );

    observations.push({
      week: w,
      dateRange,
      clinicVisits,
      clinicBaseline: baseClinic,
      clinicChangePct,
      clinicAlert,
      absenceRate,
      absenceBaseline: baseAbsence,
      absenceChangePct,
      absenceAlert,
      heatIndex,
      heatThreshold,
      heatAlert,
      dustConcentration,
      dustThreshold,
      dustAlert,
      ewmaScore,
      cusumScore,
      groundTruthIncident: isIncident,
    });
  }

  return observations;
}

export const MOCK_SITES: Site[] = [
  {
    id: 'SITE-001',
    name: 'Jaipur Textile Unit',
    nameHi: 'जयपुर टेक्सटाइल यूनिट',
    region: 'Jaipur Industrial Corridor, Rajasthan',
    regionHi: 'जयपुर औद्योगिक गलियारा, राजस्थान',
    occupation: 'Textile',
    workerCountApprox: 850,
    assignedInspector: 'Inspector R. K. Sharma',
    healthOfficerContact: 'Dr. Anita Desai, MD (Public Health)',
    latitude: 26.9124,
    longitude: 75.7873,
    dataCompletenessPct: 96,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['No missing data detected in last 26 weeks'],
    weeklyData: createObservationSeries(18, 5.2, 36.5, 135, {
      surgeWeekStart: 21,
      surgeDuration: 5,
      clinicMultiplier: 1.65, // +65% clinic visits
      absenceMultiplier: 1.5,
      dustMultiplier: 1.45, // breaches 180 µg/m³
      heatMultiplier: 1.1,
      incidentWeeks: [23, 24],
      smallCellWeeks: [3, 4],
    }),
  },
  {
    id: 'SITE-002',
    name: 'Rajasthan Stone Quarry',
    nameHi: 'राजस्थान स्टोन खदान',
    region: 'Makrana Mining Belt, Rajasthan',
    regionHi: 'मकराना खनन क्षेत्र, राजस्थान',
    occupation: 'Quarry and Mining',
    workerCountApprox: 620,
    assignedInspector: 'Inspector Vikram Singh',
    healthOfficerContact: 'Dr. Suresh Verma (District Health Mission)',
    latitude: 27.0422,
    longitude: 74.7211,
    dataCompletenessPct: 92,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['Dust sensor maintenance gap in W12'],
    weeklyData: createObservationSeries(14, 6.0, 38.0, 160, {
      surgeWeekStart: 20,
      surgeDuration: 6,
      clinicMultiplier: 1.85, // acute respiratory surge
      absenceMultiplier: 1.6,
      dustMultiplier: 1.7, // up to 270 µg/m³
      missingEnvWeeks: [12],
      incidentWeeks: [22, 23, 24],
      smallCellWeeks: [2],
    }),
  },
  {
    id: 'SITE-003',
    name: 'Industrial Waste Facility',
    nameHi: 'औद्योगिक अपशिष्ट प्रसंस्करण केंद्र',
    region: 'Bhiwadi Chemical Hub, NCR',
    regionHi: 'भिवाड़ी रासायनिक क्षेत्र, एनसीआर',
    occupation: 'Waste Management',
    workerCountApprox: 410,
    assignedInspector: 'Inspector P. N. Murthy',
    healthOfficerContact: 'Dr. Priya Sundaram (Occupational Health Cell)',
    latitude: 28.2104,
    longitude: 76.8606,
    dataCompletenessPct: 88,
    completenessStatus: 'Partial',
    missingSignalsSummary: ['Absence reporting log delayed in W17', 'Clinic registry backlog in W19'],
    weeklyData: createObservationSeries(12, 7.5, 39.5, 120, {
      surgeWeekStart: 18,
      surgeDuration: 5,
      clinicMultiplier: 1.5,
      absenceMultiplier: 1.4,
      heatMultiplier: 1.15, // reaches 45.4°C heat index
      dustMultiplier: 1.25,
      missingClinicWeeks: [19],
      incidentWeeks: [20, 21],
    }),
  },
  {
    id: 'SITE-004',
    name: 'Agricultural Work Zone',
    nameHi: 'कृषि कार्य क्षेत्र (कोटा संभाग)',
    region: 'Hadoti Agro Belt, Kota',
    regionHi: 'हाड़ौती कृषि क्षेत्र, कोटा',
    occupation: 'Agriculture',
    workerCountApprox: 1250,
    assignedInspector: 'Inspector Mahendra Solanki',
    healthOfficerContact: 'Dr. Anita Desai, MD (Public Health)',
    latitude: 25.2138,
    longitude: 75.8648,
    dataCompletenessPct: 96,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['Complete 26-week aggregated time-series'],
    weeklyData: createObservationSeries(16, 4.8, 41.0, 75, {
      surgeWeekStart: 13,
      surgeDuration: 5,
      clinicMultiplier: 1.4, // heat exhaustion & dehydration
      absenceMultiplier: 1.55,
      heatMultiplier: 1.12, // severe summer heat 46°C
      incidentWeeks: [14, 15],
      smallCellWeeks: [5, 6],
    }),
  },
  {
    id: 'SITE-005',
    name: 'Textile Processing Cluster',
    nameHi: 'वस्त्र प्रसंस्करण क्लस्टर',
    region: 'Bhilwara Textile City, Rajasthan',
    regionHi: 'भीलवाड़ा वस्त्र नगरी, राजस्थान',
    occupation: 'Textile',
    workerCountApprox: 980,
    assignedInspector: 'Inspector R. K. Sharma',
    healthOfficerContact: 'Dr. Suresh Verma (District Health Mission)',
    latitude: 25.3407,
    longitude: 74.6313,
    dataCompletenessPct: 96,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['No missing data detected'],
    weeklyData: createObservationSeries(15, 5.0, 35.0, 110, {
      surgeWeekStart: 23,
      surgeDuration: 4,
      clinicMultiplier: 1.35,
      absenceMultiplier: 1.4,
      dustMultiplier: 1.3,
      incidentWeeks: [25],
    }),
  },
  {
    id: 'SITE-006',
    name: 'Mining Operations Site',
    nameHi: 'खनन परिचालन स्थल (अलवर)',
    region: 'Alwar Mineral Zone, Rajasthan',
    regionHi: 'अलवर खनिज क्षेत्र, राजस्थान',
    occupation: 'Quarry and Mining',
    workerCountApprox: 540,
    assignedInspector: 'Inspector Vikram Singh',
    healthOfficerContact: 'Dr. Priya Sundaram (Occupational Health Cell)',
    latitude: 27.553,
    longitude: 76.6346,
    dataCompletenessPct: 81,
    completenessStatus: 'Partial',
    missingSignalsSummary: ['Clinic visits missing in W18 & W22 (Re-weighted across available signals)'],
    weeklyData: createObservationSeries(20, 6.5, 37.0, 175, {
      surgeWeekStart: 17,
      surgeDuration: 6,
      clinicMultiplier: 1.7,
      absenceMultiplier: 1.6,
      dustMultiplier: 1.5,
      missingClinicWeeks: [18, 22],
      incidentWeeks: [19, 20],
    }),
  },
  {
    id: 'SITE-007',
    name: 'Construction Work Zone',
    nameHi: 'मेट्रो अवसंरचना निर्माण क्षेत्र',
    region: 'Jaipur Metro Phase II Corridor',
    regionHi: 'जयपुर मेट्रो फेज II कॉरिडोर',
    occupation: 'Construction',
    workerCountApprox: 790,
    assignedInspector: 'Inspector P. N. Murthy',
    healthOfficerContact: 'Dr. Anita Desai, MD (Public Health)',
    latitude: 26.891,
    longitude: 75.762,
    dataCompletenessPct: 92,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['Dust telemetry sensor offline W8'],
    weeklyData: createObservationSeries(14, 5.5, 38.5, 165, {
      surgeWeekStart: 21,
      surgeDuration: 5,
      clinicMultiplier: 1.5,
      absenceMultiplier: 1.45,
      dustMultiplier: 1.4,
      heatMultiplier: 1.1,
      missingEnvWeeks: [8],
      incidentWeeks: [23],
    }),
  },
  {
    id: 'SITE-008',
    name: 'Agro-Chemical Farm Belt',
    nameHi: 'कृषि-रसायन फार्म बेल्ट (श्रीगंगानगर)',
    region: 'Canal Irrigated Belt, Sri Ganganagar',
    regionHi: 'नहर सिंचित क्षेत्र, श्रीगंगानगर',
    occupation: 'Agriculture',
    workerCountApprox: 1100,
    assignedInspector: 'Inspector Mahendra Solanki',
    healthOfficerContact: 'Dr. Suresh Verma (District Health Mission)',
    latitude: 29.9038,
    longitude: 73.8772,
    dataCompletenessPct: 96,
    completenessStatus: 'Complete',
    missingSignalsSummary: ['Nominal baseline operations, no critical breaches'],
    weeklyData: createObservationSeries(11, 3.8, 36.0, 60, {
      // Nominal site with low baseline risk throughout
      surgeWeekStart: 99,
      smallCellWeeks: [1, 2, 8, 14],
    }),
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-2026-W24-001',
    siteId: 'SITE-001',
    siteName: 'Jaipur Textile Unit',
    siteNameHi: 'जयपुर टेक्सटाइल यूनिट',
    occupation: 'Textile',
    weekDetected: 24,
    dateDetected: 'Week 24 (Mid October 2026)',
    alertLevel: 'Critical',
    combinedRiskScore: 82,
    detectionAlgorithm: 'EWMA',
    primaryContributingSignal: 'Clinic Visits (+67%) & Dust Breach',
    primaryContributingSignalHi: 'क्लिनिक विज़िट (+67%) एवं धूल सीमा उल्लंघन',
    explanationEn:
      'High-risk alert generated for Jaipur Textile Unit during Week 24. Clinic visits increased by 67% compared with the historical baseline (30 vs. 18 baseline). Sickness absence reached 7.8% (vs. 5.2% baseline), while respirable cotton dust exposure exceeded the safety threshold at 195 µg/m³. The statistical convergence of clinic surges and atmospheric particulates raised the combined risk score to 82.',
    explanationHi:
      'सप्ताह 24 के दौरान जयपुर टेक्सटाइल यूनिट के लिए उच्च जोखिम चेतावनी जारी की गई। ऐतिहासिक बेसलाइन की तुलना में क्लिनिक विज़िट में 67% की वृद्धि दर्ज की गई (18 के मुकाबले 30)। बीमारी से अनुपस्थिति दर 7.8% तक पहुंच गई (बेसलाइन 5.2%), जबकि कपास की धूल सांद्रता 195 µg/m³ के सुरक्षा मानक को पार कर गई। क्लिनिक और पर्यावरणीय वृद्धि के संयोजन से संयुक्त जोखिम स्कोर 82 हो गया।',
    plainSummaryEn:
      'In Week 24, health clinic visits and employee absences increased significantly at Jaipur Textile Unit. At the same time, factory air monitors detected high cotton dust levels. Immediate dust suppression inspection and respiratory health screenings are strongly advised.',
    plainSummaryHi:
      'सप्ताह 24 में, जयपुर टेक्सटाइल यूनिट में क्लिनिक विज़िट और बीमारी से अनुपस्थिति में उल्लेखनीय वृद्धि देखी गई। उसी समय कारखाने के वायु मॉनिटरों ने कपास की धूल का अत्यधिक स्तर दर्ज किया। तुरंत धूल नियंत्रण निरीक्षण और स्वास्थ्य जांच की सिफारिश की जाती है।',
    contributingSignals: [
      {
        name: 'Clinic Visits',
        nameHi: 'क्लिनिक विज़िट',
        currentValue: '30 visits',
        baselineValue: '18 visits',
        changePct: 67,
        severity: 'Critical',
        signalWeight: 0.35,
        description: 'Sudden spike in occupational clinic visits presenting cough and airway irritation.',
        descriptionHi: 'खांसी और सांस की तकलीफ के साथ क्लिनिक विज़िट में अचानक तीव्र वृद्धि।',
      },
      {
        name: 'Dust Exposure',
        nameHi: 'धूल सांद्रता',
        currentValue: '195 µg/m³',
        baselineValue: '135 µg/m³ (Limit: 150)',
        changePct: 44,
        severity: 'High',
        signalWeight: 0.2,
        description: 'Cotton particulate concentration breached permissible workplace exposure standard.',
        descriptionHi: 'कपास के महीन कणों की सांद्रता ने कार्यस्थल सुरक्षा सीमा पार कर दी।',
      },
      {
        name: 'Sickness Absence',
        nameHi: 'बीमारी अनुपस्थिति',
        currentValue: '7.8%',
        baselineValue: '5.2%',
        changePct: 50,
        severity: 'High',
        signalWeight: 0.3,
        description: 'Aggregated workforce absence increased by 50% relative to 26-week moving average.',
        descriptionHi: 'कर्मचारियों की अनुपस्थिति में 26 सप्ताह के औसत की तुलना में 50% की वृद्धि।',
      },
    ],
    recommendations: [
      {
        id: 'REC-01',
        action: 'Inspect factory exhaust ventilation, scrubbers, and mechanical dust-suppression units.',
        actionHi: 'फैक्ट्री के वेंटिलेशन, स्क्रबर और धूल नियंत्रण प्रणालियों का तत्काल निरीक्षण करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'Immediate',
        timeframe: 'Within 24 Hours',
        timeframeHi: '24 घंटे के भीतर',
        supportingEvidence: 'Continuous dust exposure readings > 190 µg/m³ across spinning and carding bays.',
        supportingEvidenceHi: 'कताई और कार्डिंग अनुभागों में लगातार 190 µg/m³ से अधिक धूल दर्ज।',
      },
      {
        id: 'REC-02',
        action: 'Review respiratory PPE compliance (N95/FFP2 masks) and replace loaded filter cartridges.',
        actionHi: 'रेस्पिरेटरी पीपीई (N95/FFP2 मास्क) की जांच करें और पुराने फिल्टर बदलें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'High',
        timeframe: 'Within 48 Hours',
        timeframeHi: '48 घंटे के भीतर',
        supportingEvidence: 'High proportion of clinic cases presenting upper airway irritation.',
        supportingEvidenceHi: 'श्वसन मार्ग की जलन के मामलों का क्लिनिक विज़िट में उच्च अनुपात।',
      },
      {
        id: 'REC-03',
        action: 'Conduct aggregated occupational medical review with factory dispensary doctors.',
        actionHi: 'फैक्ट्री डिस्पेंसरी डॉक्टरों के साथ समग्र व्यावसायिक स्वास्थ्य समीक्षा करें।',
        responsibleRole: 'Health Officer',
        responsibleRoleHi: 'स्वास्थ्य अधिकारी (Health Officer)',
        priority: 'High',
        timeframe: '3-5 Days',
        timeframeHi: '3-5 दिनों में',
        supportingEvidence: 'Clinic visit surge > 30 visits/week sustained over 3 consecutive weeks.',
        supportingEvidenceHi: 'लगातार 3 हफ्तों तक क्लिनिक विज़िट में 30 से अधिक की वृद्धि।',
      },
    ],
    dataQualityNotes: 'Data completeness is 96%. All 3 core surveillance signals were actively reporting during Week 24.',
    dataQualityNotesHi: 'डेटा पूर्णता 96% है। सप्ताह 24 के दौरान सभी 3 मुख्य निगरानी सिग्नल सक्रिय रूप से रिपोर्ट कर रहे थे।',
    status: 'Open',
  },
  {
    id: 'ALT-2026-W23-002',
    siteId: 'SITE-002',
    siteName: 'Rajasthan Stone Quarry',
    siteNameHi: 'राजस्थान स्टोन खदान',
    occupation: 'Quarry and Mining',
    weekDetected: 23,
    dateDetected: 'Week 23 (Early October 2026)',
    alertLevel: 'Critical',
    combinedRiskScore: 89,
    detectionAlgorithm: 'CUSUM',
    primaryContributingSignal: 'Severe Silica Dust Breach (272 µg/m³)',
    primaryContributingSignalHi: 'गंभीर सिलिका धूल उल्लंघन (272 µg/m³)',
    explanationEn:
      'Critical alert triggered for Rajasthan Stone Quarry during Week 23 via CUSUM algorithm. Environmental dust concentration reached 272 µg/m³ (81% above safe threshold), driven by stone crushing operations without active wet suppression. Concurrently, clinic consultations rose by 85% with high respiratory symptoms.',
    explanationHi:
      'CUSUM एल्गोरिदम द्वारा सप्ताह 23 के दौरान राजस्थान स्टोन खदान के लिए अति-गंभीर अलर्ट जारी किया गया। बिना गीले छिड़काव के पत्थर पिसाई के कारण धूल सांद्रता 272 µg/m³ (मानक से 81% अधिक) तक पहुंच गई। साथ ही सांस संबंधी लक्षणों के साथ क्लिनिक विज़िट में 85% की भारी वृद्धि दर्ज हुई।',
    plainSummaryEn:
      'Dangerous silica rock dust levels and a steep jump in clinic sickness visits were detected at Rajasthan Stone Quarry during Week 23. Immediate water-mist dust suppression and health reviews are urgently required.',
    plainSummaryHi:
      'सप्ताह 23 में राजस्थान स्टोन खदान में खतरनाक सिलिका धूल स्तर और क्लिनिक विज़िट में भारी उछाल देखा गया। तुरंत पानी के छिड़काव और स्वास्थ्य समीक्षा की सख्त आवश्यकता है।',
    contributingSignals: [
      {
        name: 'Dust Exposure',
        nameHi: 'धूल सांद्रता',
        currentValue: '272 µg/m³',
        baselineValue: '160 µg/m³ (Limit: 150)',
        changePct: 70,
        severity: 'Critical',
        signalWeight: 0.35,
        description: 'Heavy respirable crystalline silica aerosolization during crushing shifts.',
        descriptionHi: 'क्रशर शिफ्ट के दौरान हवा में उड़ने वाली खतरनाक सिलिका धूल की उच्च सांद्रता।',
      },
      {
        name: 'Clinic Visits',
        nameHi: 'क्लिनिक विज़िट',
        currentValue: '26 visits',
        baselineValue: '14 visits',
        changePct: 85,
        severity: 'Critical',
        signalWeight: 0.35,
        description: 'Persistent surge in acute respiratory ailments and eye irritation consultations.',
        descriptionHi: 'सांस की तकलीफ और आंखों में जलन की शिकायतों में तेज बढ़ोतरी।',
      },
      {
        name: 'Sickness Absence',
        nameHi: 'बीमारी अनुपस्थिति',
        currentValue: '9.6%',
        baselineValue: '6.0%',
        changePct: 60,
        severity: 'High',
        signalWeight: 0.3,
        description: 'Significant uptick in multi-day sickness leaves among quarry drillers.',
        descriptionHi: 'खदान ड्रिलिंग कर्मचारियों में लंबी बीमारी की छुट्टियों में भारी इजाफा।',
      },
    ],
    recommendations: [
      {
        id: 'REC-04',
        action: 'Mandate immediate operation of high-pressure water sprinkler nozzles on crushing chutes.',
        actionHi: 'क्रशर पर उच्च दबाव वाले पानी के फव्वारों का अनिवार्य संचालन सुनिश्चित करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'Immediate',
        timeframe: 'Immediate (Within 12 Hours)',
        timeframeHi: 'तत्काल (12 घंटे के भीतर)',
        supportingEvidence: 'Dust levels exceeded 270 µg/m³ on dry crushing conveyor line.',
        supportingEvidenceHi: 'सूखी पिसाई कन्वेयर लाइन पर धूल का स्तर 270 µg/m³ पार कर गया।',
      },
      {
        id: 'REC-05',
        action: 'Initiate mobile occupational chest screening (spirometry) camp for quarry cohort.',
        actionHi: 'खदान श्रमिकों के लिए फेफड़ों की जांच (स्पायरोमेट्री) शिविर आयोजित करें।',
        responsibleRole: 'Health Officer',
        responsibleRoleHi: 'स्वास्थ्य अधिकारी (Health Officer)',
        priority: 'High',
        timeframe: 'Next 7 Days',
        timeframeHi: 'अगले 7 दिनों में',
        supportingEvidence: 'CUSUM score sustained above decision interval h=4.5 for 3 consecutive weeks.',
        supportingEvidenceHi: 'लगातार 3 सप्ताह से CUSUM स्कोर सीमा h=4.5 से अधिक बना हुआ है।',
      },
    ],
    dataQualityNotes: 'Completeness 92%. Sensor recalibrated successfully in Week 13.',
    dataQualityNotesHi: 'पूर्णता 92%। सेंसर सप्ताह 13 में पुनः कैलिब्रेट किया गया।',
    status: 'Under Investigation',
  },
  {
    id: 'ALT-2026-W22-003',
    siteId: 'SITE-007',
    siteName: 'Construction Work Zone',
    siteNameHi: 'मेट्रो अवसंरचना निर्माण क्षेत्र',
    occupation: 'Construction',
    weekDetected: 22,
    dateDetected: 'Week 22 (Late September 2026)',
    alertLevel: 'High',
    combinedRiskScore: 68,
    detectionAlgorithm: 'EWMA',
    primaryContributingSignal: 'Combined Heat Stress & Concrete Dust',
    primaryContributingSignalHi: 'गर्मी का तनाव एवं कंक्रीट धूल का संयुक्त प्रभाव',
    explanationEn:
      'High-level alert generated for Construction Work Zone in Week 22. Afternoon ambient wet-bulb globe temperature indicated Heat Index of 42.4°C while excavation generated dust at 230 µg/m³. Workforce sickness absence climbed to 8.0% (vs. 5.5% baseline).',
    explanationHi:
      'सप्ताह 22 में निर्माण क्षेत्र के लिए उच्च स्तरीय चेतावनी जारी की गई। दोपहर का हीट इंडेक्स 42.4°C तक पहुंच गया और खुदाई कार्य से धूल 230 µg/m³ दर्ज हुई। बीमारी से अनुपस्थिति दर 8.0% (बेसलाइन 5.5%) तक बढ़ गई।',
    plainSummaryEn:
      'Simultaneous extreme afternoon heat and excavation concrete dust elevated worker sickness absence at Construction Work Zone. Shaded rest shelters, hydration scheduling, and site water damping are recommended.',
    plainSummaryHi:
      'दोपहर की भीषण गर्मी और कंक्रीट की धूल के कारण निर्माण कार्य क्षेत्र में श्रमिकों की बीमारी में वृद्धि हुई। छायादार विश्राम स्थल, पीने का पानी और पानी के छिड़काव की सिफारिश की जाती है।',
    contributingSignals: [
      {
        name: 'Heat Exposure',
        nameHi: 'गर्मी का प्रभाव',
        currentValue: '42.4°C',
        baselineValue: '38.5°C (Limit: 40.0)',
        changePct: 10,
        severity: 'High',
        signalWeight: 0.2,
        description: 'Hazardous heat index during peak direct sun exposure hours.',
        descriptionHi: 'दोपहर की सीधी धूप के दौरान खतरनाक हीट इंडेक्स।',
      },
      {
        name: 'Dust Exposure',
        nameHi: 'धूल सांद्रता',
        currentValue: '230 µg/m³',
        baselineValue: '165 µg/m³ (Limit: 150)',
        changePct: 39,
        severity: 'High',
        signalWeight: 0.2,
        description: 'Excavation and cement batching particulate dispersion.',
        descriptionHi: 'खुदाई और सीमेंट मिश्रण से उत्पन्न धूल के कणों का फैलाव।',
      },
      {
        name: 'Sickness Absence',
        nameHi: 'बीमारी अनुपस्थिति',
        currentValue: '8.0%',
        baselineValue: '5.5%',
        changePct: 45,
        severity: 'High',
        signalWeight: 0.3,
        description: 'Absence driven by heat exhaustion, dehydration, and conjunctival irritation.',
        descriptionHi: 'गर्मी की थकावट, डिहाइड्रेशन और आंखों की जलन के कारण अनुपस्थिति में वृद्धि।',
      },
    ],
    recommendations: [
      {
        id: 'REC-06',
        action: 'Mandate shaded hydration rest breaks every 45 minutes during 12:00–15:30 peak heat hours.',
        actionHi: 'दोपहर 12:00 से 15:30 के बीच हर 45 मिनट में छायादार स्थान पर पानी पीने का ब्रेक अनिवार्य करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'Immediate',
        timeframe: 'Same-Day Implementation',
        timeframeHi: 'उसी दिन लागू करें',
        supportingEvidence: 'Heat Index exceeded 42°C with 3 consecutive days of sustained thermal stress.',
        supportingEvidenceHi: 'लगातार 3 दिनों तक हीट इंडेक्स 42°C से ऊपर दर्ज किया गया।',
      },
      {
        id: 'REC-07',
        action: 'Deploy mobile water tankers for continuous damping on unpaved haul roads.',
        actionHi: 'धूल रोकने के लिए कच्चे रास्तों पर पानी के टैंकरों से लगातार छिड़काव करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'High',
        timeframe: 'Within 24 Hours',
        timeframeHi: '24 घंटे के भीतर',
        supportingEvidence: 'Roadway transport dust spiked to 230 µg/m³.',
        supportingEvidenceHi: 'वाहनों की आवाजाही से धूल 230 µg/m³ तक पहुंच गई।',
      },
    ],
    dataQualityNotes: 'Data completeness 92%. Sensor telemetry stable.',
    dataQualityNotesHi: 'डेटा पूर्णता 92%। टेलीमेट्री सिग्नल स्थिर।',
    status: 'Open',
  },
  {
    id: 'ALT-2026-W20-004',
    siteId: 'SITE-003',
    siteName: 'Industrial Waste Facility',
    siteNameHi: 'औद्योगिक अपशिष्ट प्रसंस्करण केंद्र',
    occupation: 'Waste Management',
    weekDetected: 20,
    dateDetected: 'Week 20 (Mid September 2026)',
    alertLevel: 'High',
    combinedRiskScore: 71,
    detectionAlgorithm: 'EWMA',
    primaryContributingSignal: 'Sickness Absence Surge & Heat Stress',
    primaryContributingSignalHi: 'बीमारी अनुपस्थिति में वृद्धि एवं गर्मी का तनाव',
    explanationEn:
      'High alert registered for Industrial Waste Facility in Week 20. Sickness absence surged to 10.5% (40% increase over 7.5% baseline) coinciding with Heat Index of 45.4°C during outdoor sorting shifts. Note: Clinic data was missing for W19 and re-weighted across absence and environmental metrics.',
    explanationHi:
      'सप्ताह 20 में औद्योगिक अपशिष्ट केंद्र के लिए उच्च अलर्ट दर्ज हुआ। खुली हवा में छंटाई के दौरान 45.4°C हीट इंडेक्स के साथ बीमारी अनुपस्थिति बढ़कर 10.5% (बेसलाइन से 40% वृद्धि) हो गई। ध्यान दें: W19 के लिए क्लिनिक डेटा अनुपलब्ध था और शेष संकेतों पर भार पुनर्गठित किया गया।',
    plainSummaryEn:
      'Intense humid heat combined with bio-waste decomposition fumes led to high sickness absences in Week 20. Protective shifts, enhanced ventilation, and rehydration salt distribution are urgently recommended.',
    plainSummaryHi:
      'अत्यधिक गर्मी और अपशिष्ट से उठने वाली गैसों के कारण सप्ताह 20 में बीमारी से अनुपस्थिति काफी बढ़ गई। पाली समय में बदलाव, बेहतर वेंटिलेशन और ओआरएस वितरण की सिफारिश की जाती है।',
    contributingSignals: [
      {
        name: 'Heat Exposure',
        nameHi: 'गर्मी का प्रभाव',
        currentValue: '45.4°C',
        baselineValue: '39.5°C (Limit: 40.0)',
        changePct: 15,
        severity: 'Critical',
        signalWeight: 0.5,
        description: 'Extreme heat index under high relative humidity conditions.',
        descriptionHi: 'उच्च आर्द्रता में अत्यधिक खतरनाक हीट इंडेक्स।',
      },
      {
        name: 'Sickness Absence',
        nameHi: 'बीमारी अनुपस्थिति',
        currentValue: '10.5%',
        baselineValue: '7.5%',
        changePct: 40,
        severity: 'High',
        signalWeight: 0.5,
        description: 'High absenteeism reported among manual refuse sorting personnel.',
        descriptionHi: 'मैन्युअल कचरा छंटाई कर्मचारियों में बीमारी से अनुपस्थिति का उच्च स्तर।',
      },
    ],
    recommendations: [
      {
        id: 'REC-08',
        action: 'Shift heavy manual outdoor sorting to early morning (05:30–09:30) and evening hours.',
        actionHi: 'भारी मैनुअल छंटाई का कार्य सुबह (05:30–09:30) या शाम की पाली में स्थानांतरित करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'Immediate',
        timeframe: 'Immediate',
        timeframeHi: 'तुरंत',
        supportingEvidence: 'Heat Index exceeded 45°C triggering thermal stress protocols.',
        supportingEvidenceHi: 'हीट इंडेक्स 45°C पार कर गया, जिससे थर्मल प्रोटोकॉल सक्रिय हुआ।',
      },
      {
        id: 'REC-09',
        action: 'Distribute oral rehydration solutions (ORS) and install industrial misting fans.',
        actionHi: 'ओआरएस पैकेट वितरित करें और औद्योगिक मिस्टिंग पंखे स्थापित करें।',
        responsibleRole: 'Health Officer',
        responsibleRoleHi: 'स्वास्थ्य अधिकारी (Health Officer)',
        priority: 'High',
        timeframe: 'Within 24 Hours',
        timeframeHi: '24 घंटे के भीतर',
        supportingEvidence: 'Absence rate spiked by 40% in direct heat exposure bays.',
        supportingEvidenceHi: 'सीधी गर्मी वाले क्षेत्रों में अनुपस्थिति दर 40% बढ़ गई।',
      },
    ],
    dataQualityNotes: 'Partial data completeness (88%). Clinic registry backlog in W19 re-weighted proportionally.',
    dataQualityNotesHi: 'आंशिक डेटा पूर्णता (88%)। W19 का क्लिनिक डेटा लापता था, जिसे आनुपातिक रूप से पुनर्गठित किया गया।',
    status: 'Mitigated',
  },
  {
    id: 'ALT-2026-W15-005',
    siteId: 'SITE-004',
    siteName: 'Agricultural Work Zone',
    siteNameHi: 'कृषि कार्य क्षेत्र (कोटा संभाग)',
    occupation: 'Agriculture',
    weekDetected: 15,
    dateDetected: 'Week 15 (Early August 2026)',
    alertLevel: 'High',
    combinedRiskScore: 66,
    detectionAlgorithm: 'EWMA',
    primaryContributingSignal: 'Extreme Heat Index (46.2°C)',
    primaryContributingSignalHi: 'भीषण गर्मी का प्रभाव (46.2°C)',
    explanationEn:
      'High alert detected during summer harvest in Week 15. Ambient weather stations logged Heat Index of 46.2°C. Clinic consultations for dehydration and cramping increased by 40%.',
    explanationHi:
      'सप्ताह 15 में ग्रीष्मकालीन कटाई के दौरान उच्च अलर्ट जारी किया गया। मौसम केंद्रों ने 46.2°C हीट इंडेक्स दर्ज किया। डिहाइड्रेशन और मांसपेशियों में ऐंठन के मामलों में 40% की वृद्धि हुई।',
    plainSummaryEn:
      'Dangerous summer harvesting temperatures created high heat stress in Week 15. Providing covered rest shelters and scheduled water breaks successfully lowered subsequent risk.',
    plainSummaryHi:
      'सप्ताह 15 में भीषण गर्मी ने खेत कामगारों में हीट स्ट्रेस बढ़ाया। छायादार आश्रय और नियमित पानी के ब्रेक ने बाद के हफ्तों में जोखिम को कम किया।',
    contributingSignals: [
      {
        name: 'Heat Exposure',
        nameHi: 'गर्मी का प्रभाव',
        currentValue: '46.2°C',
        baselineValue: '41.0°C (Limit: 40.0)',
        changePct: 13,
        severity: 'Critical',
        signalWeight: 0.35,
        description: 'Sustained heatwave conditions over open farmland.',
        descriptionHi: 'खुले खेतों में लगातार लू और भीषण गर्मी की स्थिति।',
      },
      {
        name: 'Sickness Absence',
        nameHi: 'बीमारी अनुपस्थिति',
        currentValue: '7.4%',
        baselineValue: '4.8%',
        changePct: 54,
        severity: 'High',
        signalWeight: 0.3,
        description: 'Sharp elevation in agricultural field worker absenteeism.',
        descriptionHi: 'खेत मजदूरों की अनुपस्थिति में 54% की तीव्र वृद्धि।',
      },
    ],
    recommendations: [
      {
        id: 'REC-10',
        action: 'Erect mobile canopy shade tents across harvest sectors and mandate frequent hydration.',
        actionHi: 'खेतों में मोबाइल शामियाना टेंट लगाएं और बार-बार पानी पीना अनिवार्य करें।',
        responsibleRole: 'Site Inspector',
        responsibleRoleHi: 'श्रम एवं सुरक्षा निरीक्षक (Site Inspector)',
        priority: 'Immediate',
        timeframe: 'Completed',
        timeframeHi: 'पूर्ण',
        supportingEvidence: 'Heat Index breached Level 4 extreme risk threshold.',
        supportingEvidenceHi: 'हीट इंडेक्स ने लेवल 4 अत्यधिक जोखिम सीमा पार की।',
      },
    ],
    dataQualityNotes: 'Data completeness 96%. All agricultural health centers reporting.',
    dataQualityNotesHi: 'डेटा पूर्णता 96%। सभी प्राथमिक स्वास्थ्य केंद्र नियमित रूप से रिपोर्ट कर रहे हैं।',
    status: 'Mitigated',
  },
];

// Realistic Backtesting evaluation metrics comparing EWMA vs CUSUM
export const MOCK_BACKTEST_DATA: Record<'EWMA' | 'CUSUM', BacktestMetrics> = {
  EWMA: {
    leadTimeWeeks: 2.8,
    sensitivityPct: 87.5,
    ppvPct: 82.4,
    falseAlarmRatePct: 11.2,
    totalReferenceEvents: 16,
    detectedEvents: 14,
    missedEvents: 2,
    falseAlarmsCount: 3,
    trueNegativesCount: 189,
    evaluationWindowWeeks: 26,
  },
  CUSUM: {
    leadTimeWeeks: 3.4,
    sensitivityPct: 93.8,
    ppvPct: 78.9,
    falseAlarmRatePct: 15.6,
    totalReferenceEvents: 16,
    detectedEvents: 15,
    missedEvents: 1,
    falseAlarmsCount: 4,
    trueNegativesCount: 184,
    evaluationWindowWeeks: 26,
  },
};
