import jsPDF from 'jspdf';
import { AuditRecord } from '../types.js';

export function exportAuditToPDF(audit: AuditRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Colors
  const darkNavy = [15, 23, 42]; // #0f172a
  const tealAccent = [13, 148, 136]; // #0d9488
  const grayText = [71, 85, 105]; // #475569
  const lightBg = [248, 250, 252]; // #f8fafc

  // 1. Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('WebsiteXRay', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Strict Technical Website Audit & Remediation Checklist', margin, 20);

  const dateStr = new Date(audit.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 35, 14);
  doc.text('Strict Marking Standard', pageWidth - margin - 35, 20);

  y = 34;

  // 2. Domain & Overall Health Score
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Audit for: ${audit.domain}`, margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`Target URL: ${audit.url}`, margin + 6, y + 16);
  doc.text(`Grading Standard: Strict Industrial Criteria & Web Vitals Thresholds`, margin + 6, y + 22);

  // Score Badge
  const score = audit.overallScore;
  doc.setFillColor(score >= 80 ? 16 : score >= 60 ? 217 : 225, score >= 80 ? 185 : score >= 60 ? 119 : 29, score >= 80 ? 129 : score >= 60 ? 6 : 72);
  doc.roundedRect(pageWidth - margin - 36, y + 4, 30, 26, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${score}`, pageWidth - margin - 25, y + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text('/ 100 HEALTH', pageWidth - margin - 25, y + 23, { align: 'center' });

  y += 40;

  // 3. Category Score Summary Cards
  const catWidth = (contentWidth - 8) / 5;
  const categories = [
    { label: 'Performance', score: audit.categoryScores.performance },
    { label: 'SEO', score: audit.categoryScores.seo },
    { label: 'Accessibility', score: audit.categoryScores.accessibility },
    { label: 'Best Practices', score: audit.categoryScores.bestPractices },
    { label: 'UX & Conv.', score: audit.categoryScores.uxConversion },
  ];

  categories.forEach((cat, idx) => {
    const cx = margin + idx * (catWidth + 2);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(cx, y, catWidth, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(`${cat.score}/100`, cx + catWidth / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(cat.label, cx + catWidth / 2, y + 14, { align: 'center' });
  });

  y += 24;

  // 4. Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Strict Executive Summary', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(audit.aiAnalysis.executiveSummary, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.2 + 6;

  // 5. Observed Facts
  if (audit.aiAnalysis.observedFacts && audit.aiAnalysis.observedFacts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
    doc.text('Verified Technical Observations', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);

    audit.aiAnalysis.observedFacts.slice(0, 4).forEach((fact) => {
      doc.text(`• ${fact}`, margin + 2, y);
      y += 4;
    });
    y += 4;
  }

  // 6. Actionable Implementation To-Do Checklist
  const todoList = audit.aiAnalysis.todoChecklist && audit.aiAnalysis.todoChecklist.length > 0
    ? audit.aiAnalysis.todoChecklist
    : (audit.aiAnalysis.top10Fixes || audit.ruleBasedIssues.slice(0, 8)).map((item, idx) => ({
        id: `td-${idx}`,
        text: `[${item.category}] ${item.problem}: ${item.fix}`,
        category: item.category,
        priority: item.priority,
        completed: false,
      }));

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Actionable Implementation To-Do Checklist', margin, y);
  y += 6;

  todoList.slice(0, 6).forEach((todo) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'S');

    doc.setDrawColor(148, 163, 184);
    doc.rect(margin + 4, y + 4.5, 4.5, 4.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(todo.priority === 'Critical' ? 185 : 71, todo.priority === 'Critical' ? 28 : 85, todo.priority === 'Critical' ? 28 : 105);
    doc.text(`[${todo.priority.toUpperCase()}] [${todo.category}]`, margin + 11, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    const todoLine = doc.splitTextToSize(todo.text, contentWidth - 16);
    doc.text(todoLine.slice(0, 1), margin + 11, y + 10.5);

    y += 16;
  });

  // Page 2: Core Web Vitals & Action Plan Matrix
  doc.addPage();
  y = 20;

  // Header banner on page 2
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`WebsiteXRay Strict Audit Report — ${audit.domain}`, margin, 8);
  doc.text('Page 2 of 2', pageWidth - margin - 15, 8);

  y = 20;

  // Core Web Vitals Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Core Web Vitals & Responsiveness (Mobile)', margin, y);
  y += 6;

  const vitals = audit.pageSpeed.mobile.vitals;
  const vitalMetrics = [
    { label: 'Largest Contentful Paint (LCP)', val: vitals.lcp.label, threshold: '< 2.5s' },
    { label: 'First Contentful Paint (FCP)', val: vitals.fcp.label, threshold: '< 1.8s' },
    { label: 'Cumulative Layout Shift (CLS)', val: vitals.cls.label, threshold: '< 0.1' },
    { label: 'Total Blocking Time (TBT)', val: vitals.tbt.label, threshold: '< 200ms' },
    { label: 'Speed Index', val: vitals.speedIndex.label, threshold: '< 3.4s' },
  ];

  vitalMetrics.forEach((m, idx) => {
    const rowY = y + idx * 8;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, rowY, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(m.label, margin + 4, rowY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(m.val, margin + 110, rowY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Strict Target: ${m.threshold}`, margin + 135, rowY + 5);
  });

  y += vitalMetrics.length * 8 + 8;

  // Prioritized Action Plan Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Prioritized Implementation Action Plan', margin, y);
  y += 6;

  const plan = audit.aiAnalysis.prioritizedActionPlan;

  // Priority 1
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text('Priority 1: Fix Immediately (Strict Ranking & Conversion Blocker)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  let p1Y = y + 12;
  (plan.priority1Immediate || []).slice(0, 3).forEach((p) => {
    doc.text(`• [${p.category}] ${p.problem} -> Fix: ${p.fix.slice(0, 80)}...`, margin + 6, p1Y);
    p1Y += 5;
  });

  y += 36;

  // Priority 2
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(161, 98, 7);
  doc.text('Priority 2: Fix Next (Core SEO & Conversion Optimizations)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  let p2Y = y + 12;
  (plan.priority2Next || []).slice(0, 3).forEach((p) => {
    doc.text(`• [${p.category}] ${p.problem} -> Fix: ${p.fix.slice(0, 80)}...`, margin + 6, p2Y);
    p2Y += 5;
  });

  y += 36;

  // Priority 3
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text('Priority 3: Continuous Enhancements', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  let p3Y = y + 12;
  (plan.priority3Improvements || []).slice(0, 3).forEach((p) => {
    doc.text(`• [${p.category}] ${p.problem} -> Fix: ${p.fix.slice(0, 80)}...`, margin + 6, p3Y);
    p3Y += 5;
  });

  y += 36;

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('Generated by WebsiteXRay • Strict Technical Audit & Optimization Platform', pageWidth / 2, 285, { align: 'center' });

  // Trigger download in browser
  const sanitizedDomain = audit.domain.replace(/[^a-z0-9]/gi, '_');
  doc.save(`WebsiteXRay_Strict_Audit_${sanitizedDomain}.pdf`);
}
