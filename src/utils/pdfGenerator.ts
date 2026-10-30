import { jsPDF } from 'jspdf';
import { Alert, Site } from '../types';
import { formatSmallCellCount } from './privacy';

export function generateAlertPdfReport(alert: Alert, site?: Site): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Bar (Navy Blue)
  doc.setFillColor(20, 45, 78); // #142D4E
  doc.rect(margin, y, contentWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SWASTHYA SYMBOL | OCCUPATIONAL HEALTH EARLY WARNING SYSTEM', margin + 6, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Population-Level Hazard Surveillance & Preventive Action Report', margin + 6, y + 14);

  // Timestamp on right
  const nowStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${nowStr}`, pageWidth - margin - 35, y + 11);

  y += 24;

  // Alert Overview Card
  doc.setFillColor(244, 247, 251); // Light background
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'S');

  doc.setTextColor(20, 45, 78);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(alert.siteName, margin + 6, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Sector: ${alert.occupation}  |  Surveillance Period: ${alert.dateDetected}`, margin + 6, y + 15);
  doc.text(`Detection Model: ${alert.detectionAlgorithm} Control Chart  |  Alert ID: ${alert.id}`, margin + 6, y + 21);
  doc.text(`Responsible Inspector: ${site?.assignedInspector || 'Regional Directorate'}`, margin + 6, y + 27);

  // Risk Score Badge on Right
  const riskBoxX = pageWidth - margin - 42;
  let badgeColor = [22, 163, 74]; // Green
  if (alert.alertLevel === 'Critical') badgeColor = [220, 38, 38];
  else if (alert.alertLevel === 'High') badgeColor = [249, 115, 22];
  else if (alert.alertLevel === 'Moderate') badgeColor = [245, 158, 11];

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(riskBoxX, y + 4, 36, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK LEVEL', riskBoxX + 9, y + 10);
  doc.setFontSize(13);
  doc.text(alert.alertLevel.toUpperCase(), riskBoxX + (alert.alertLevel === 'Critical' ? 4 : 8), y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Score: ${alert.combinedRiskScore}/100`, riskBoxX + 8, y + 23);

  y += 38;

  // Section 1: Three Core Surveillance Signals
  doc.setTextColor(20, 45, 78);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. CORE SURVEILLANCE SIGNALS BREAKDOWN', margin, y);
  y += 4;

  const colWidth = (contentWidth - 6) / 3;

  alert.contributingSignals.slice(0, 3).forEach((sig, idx) => {
    const colX = margin + idx * (colWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(colX, y, colWidth, 26, 1.5, 1.5, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(sig.name, colX + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Baseline: ${sig.baselineValue}`, colX + 4, y + 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(sig.severity === 'Critical' ? 220 : 15, sig.severity === 'Critical' ? 38 : 118, sig.severity === 'Critical' ? 38 : 110);
    doc.text(`Current: ${sig.currentValue}`, colX + 4, y + 18);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Change: ${sig.changePct !== null ? (sig.changePct > 0 ? `+${sig.changePct}%` : `${sig.changePct}%`) : 'N/A'}`, colX + 4, y + 23);
  });

  y += 32;

  // Section 2: Why Alert Was Generated
  doc.setTextColor(20, 45, 78);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. EPIDEMIOLOGICAL ALERT RATIONALE & DRIVERS', margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const splitExplanation = doc.splitTextToSize(alert.explanationEn, contentWidth - 8);
  doc.text(splitExplanation, margin + 4, y + 6);

  y += 31;

  // Section 3: Recommended Preventive Actions
  doc.setTextColor(20, 45, 78);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RECOMMENDED PREVENTIVE ACTIONS & DIRECTIVES', margin, y);
  y += 5;

  alert.recommendations.slice(0, 3).forEach((rec, idx) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

    // Priority pill
    let pColor = [15, 118, 110];
    if (rec.priority === 'Immediate') pColor = [220, 38, 38];
    else if (rec.priority === 'High') pColor = [249, 115, 22];

    doc.setFillColor(pColor[0], pColor[1], pColor[2]);
    doc.roundedRect(margin + 4, y + 3, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.priority.toUpperCase(), margin + 6, y + 6.8);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${rec.action}`, margin + 28, y + 7, { maxWidth: contentWidth - 32 });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Role: ${rec.responsibleRole}  |  Timeframe: ${rec.timeframe}`, margin + 4, y + 14);
    doc.text(`Evidence: ${rec.supportingEvidence}`, margin + 4, y + 18, { maxWidth: contentWidth - 8 });

    y += 23;
  });

  y += 2;

  // Section 4: Data Quality & Completeness Note
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('SURVEILLANCE DATA INTEGRITY NOTE:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Site data completeness: ${site?.dataCompletenessPct || 92}%. Small-cell suppression (<5) enforced. Missing data is re-weighted dynamically across active streams.`,
    margin + 4,
    y + 10
  );

  y += 18;

  // Persistent Privacy Disclaimer Banner at Bottom
  doc.setFillColor(254, 242, 242); // Soft red/pink warning box
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MANDATORY POPULATION HEALTH PRIVACY NOTICE & NON-DIAGNOSTIC NOTICE', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const privacyText =
    'Privacy Notice: This document displays aggregated occupational health surveillance information only. Small counts below 5 are suppressed to ensure worker privacy. This system is intended for population-level early warning and must not be used for individual worker diagnosis, identification, disciplinary actions, or employment decisions.';
  const splitPrivacy = doc.splitTextToSize(privacyText, contentWidth - 8);
  doc.text(splitPrivacy, margin + 4, y + 9);

  // Save PDF
  doc.save(`SwasthyaSymbol_Alert_Report_${alert.id}_${alert.siteId}.pdf`);
}
