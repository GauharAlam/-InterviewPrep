import { jsPDF } from 'jspdf';

// ─── Color Palette ─────────────────────────────────────────────
const COLORS = {
    bgDark: [19, 0, 26],
    bgCard: [30, 10, 46],
    primary: [168, 85, 247],
    accent: [236, 72, 153],
    cyan: [34, 211, 238],
    yellow: [251, 191, 36],
    danger: [244, 63, 94],
    textPrimary: [240, 230, 255],
    textSecondary: [167, 139, 223],
    border: [59, 29, 94],
    white: [255, 255, 255],
};

const getScoreColor = (score, max = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return COLORS.cyan;
    if (pct >= 40) return COLORS.yellow;
    return COLORS.danger;
};

// ─── Helper Functions ──────────────────────────────────────────
const drawRoundedRect = (doc, x, y, w, h, r, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, 'F');
};

const drawGradientBar = (doc, x, y, w, h, score, maxScore = 100) => {
    // Background
    drawRoundedRect(doc, x, y, w, h, 2, COLORS.bgDark);
    // Fill
    const fillWidth = (score / maxScore) * w;
    const color = getScoreColor(score, maxScore);
    drawRoundedRect(doc, x, y, Math.max(fillWidth, 4), h, 2, color);
};

const addPage = (doc) => {
    doc.addPage();
    doc.setFillColor(...COLORS.bgDark);
    doc.rect(0, 0, 210, 297, 'F');
    return 20; // starting Y
};

const drawFooter = (doc, pageNum) => {
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(`AI InterviewPrep • Generated ${new Date().toLocaleDateString()} • Page ${pageNum}`, 105, 290, { align: 'center' });
};

// ─── Dashboard Report ──────────────────────────────────────────
export const generateDashboardReport = (stats, user) => {
    const doc = new jsPDF();
    let y = 0;

    // ── Page 1: Cover + Scores ──
    doc.setFillColor(...COLORS.bgDark);
    doc.rect(0, 0, 210, 297, 'F');

    // Header gradient bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 210, 4, 'F');

    // Logo & Title
    y = 25;
    drawRoundedRect(doc, 20, y, 38, 12, 3, COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('AI InterviewPrep', 22, y + 8);

    y = 50;
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Interview Performance', 20, y);
    y += 10;
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.primary);
    doc.text('Report', 20, y);

    y += 14;
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(`Candidate: ${user?.name || 'Student'}`, 20, y);
    y += 6;
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);

    // Divider
    y += 12;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);

    // ── Score Cards ──
    y += 14;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Score Summary', 20, y);
    y += 10;

    const scores = [
        { label: 'Resume / ATS Score', value: stats?.resumeScore || 0 },
        { label: 'Coding Score', value: stats?.codingScore || 0 },
        { label: 'Communication Score', value: stats?.communicationScore || 0 },
        { label: 'Overall Score', value: stats?.overallScore || 0 },
    ];

    scores.forEach((s) => {
        drawRoundedRect(doc, 20, y, 170, 22, 4, COLORS.bgCard);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textSecondary);
        doc.text(s.label, 28, y + 9);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...getScoreColor(s.value));
        doc.text(`${s.value}/100`, 160, y + 10, { align: 'right' });

        drawGradientBar(doc, 28, y + 15, 140, 3, s.value);
        y += 28;
    });

    // Stats summary
    y += 8;
    drawRoundedRect(doc, 20, y, 170, 30, 4, COLORS.bgCard);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textSecondary);

    const statItems = [
        `📝 ${stats?.totalSubmissions || 0} Coding Submissions`,
        `🎤 ${stats?.totalVoiceSessions || 0} Voice Sessions`,
        `📊 ${stats?.totalInterviews || 0} Total Interviews`
    ];
    statItems.forEach((item, i) => {
        doc.text(item, 28, y + 10 + (i * 7));
    });

    drawFooter(doc, 1);

    // ── Save ──
    doc.save(`InterviewPrep_Report_${user?.name?.replace(/\s/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ─── Interview Scorecard Report ────────────────────────────────
export const generateScorecardReport = (scorecard, config = {}) => {
    const doc = new jsPDF();
    let y = 0;
    let pageNum = 1;

    // ── Page 1: Cover + Verdict + Category Scores ──
    doc.setFillColor(...COLORS.bgDark);
    doc.rect(0, 0, 210, 297, 'F');

    // Header bar
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, 210, 4, 'F');

    // Logo
    y = 25;
    drawRoundedRect(doc, 20, y, 38, 12, 3, COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('AI InterviewPrep', 22, y + 8);

    // Title
    y = 48;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Mock Interview', 20, y);
    y += 10;
    doc.setTextColor(...COLORS.accent);
    doc.text('Scorecard', 20, y);

    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(`Role: ${config.role || 'Full Stack Developer'}`, 20, y);
    y += 6;
    doc.text(`Duration: ${config.duration || 'N/A'} • Questions: ${config.totalQuestions || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);

    // Divider
    y += 10;
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);

    // ── Verdict Box ──
    y += 10;
    const verdictColor = scorecard.verdict?.includes('No') ? COLORS.danger :
        scorecard.verdict?.includes('Lean') ? COLORS.yellow : COLORS.cyan;

    drawRoundedRect(doc, 20, y, 170, 38, 6, COLORS.bgCard);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...verdictColor);
    doc.text(`${scorecard.overallScore}/100`, 105, y + 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text(scorecard.verdict || 'N/A', 105, y + 30, { align: 'center' });

    // ── Category Scores ──
    y += 48;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Category Scores', 20, y);
    y += 8;

    if (scorecard.categories) {
        Object.entries(scorecard.categories).forEach(([key, cat]) => {
            if (y > 260) { y = addPage(doc); pageNum++; }

            drawRoundedRect(doc, 20, y, 170, 24, 4, COLORS.bgCard);

            const label = key.replace(/([A-Z])/g, ' $1').trim();
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.textPrimary);
            doc.text(label, 28, y + 8);

            doc.setFontSize(14);
            doc.setTextColor(...getScoreColor(cat.score, 10));
            doc.text(`${cat.score}/10`, 162, y + 9, { align: 'right' });

            drawGradientBar(doc, 28, y + 13, 140, 3, cat.score, 10);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textSecondary);
            const feedbackText = doc.splitTextToSize(cat.feedback || '', 140);
            doc.text(feedbackText[0] || '', 28, y + 20);

            y += 28;
        });
    }

    drawFooter(doc, pageNum);

    // ── Page 2: Question Analysis ──
    y = addPage(doc);
    pageNum++;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Question-by-Question Analysis', 20, y);
    y += 10;

    if (scorecard.questionAnalysis) {
        scorecard.questionAnalysis.forEach((qa, i) => {
            if (y > 255) { y = addPage(doc); pageNum++; drawFooter(doc, pageNum); }

            const qualityColor = qa.answerQuality === 'strong' ? COLORS.cyan :
                qa.answerQuality === 'adequate' ? COLORS.yellow :
                    qa.answerQuality === 'weak' ? [245, 158, 11] : COLORS.danger;

            drawRoundedRect(doc, 20, y, 170, 30, 4, COLORS.bgCard);

            // Quality badge
            drawRoundedRect(doc, 158, y + 3, 28, 8, 2, qualityColor);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.white);
            doc.text(qa.answerQuality?.toUpperCase() || 'N/A', 172, y + 8, { align: 'center' });

            // Question
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.textPrimary);
            const qLines = doc.splitTextToSize(`Q${i + 1}: ${qa.question}`, 130);
            doc.text(qLines.slice(0, 2), 28, y + 9);

            // Feedback
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textSecondary);
            const fLines = doc.splitTextToSize(qa.feedback || '', 150);
            doc.text(fLines.slice(0, 2), 28, y + 22);

            y += 34;
        });
    }

    drawFooter(doc, pageNum);

    // ── Page 3: Strengths, Weaknesses, Recommendations ──
    y = addPage(doc);
    pageNum++;

    // Strengths
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.cyan);
    doc.text('💪 Strengths', 20, y);
    y += 8;

    scorecard.strengths?.forEach((s) => {
        drawRoundedRect(doc, 20, y, 170, 10, 3, COLORS.bgCard);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textPrimary);
        doc.text(`✓  ${s}`, 28, y + 7);
        y += 13;
    });

    y += 8;

    // Weaknesses
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.danger);
    doc.text('⚠️ Areas to Improve', 20, y);
    y += 8;

    scorecard.weaknesses?.forEach((w) => {
        drawRoundedRect(doc, 20, y, 170, 10, 3, COLORS.bgCard);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textPrimary);
        doc.text(`→  ${w}`, 28, y + 7);
        y += 13;
    });

    y += 8;

    // Topics to Study
    if (scorecard.topicsToStudy?.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('📚 Recommended Study Topics', 20, y);
        y += 8;

        scorecard.topicsToStudy.forEach((topic) => {
            if (y > 270) { y = addPage(doc); pageNum++; }
            drawRoundedRect(doc, 20, y, 170, 10, 3, COLORS.bgCard);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.primary);
            doc.text(`📖  ${topic}`, 28, y + 7);
            y += 13;
        });
    }

    y += 8;

    // Overall Feedback
    if (scorecard.overallFeedback && y < 240) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.textPrimary);
        doc.text('📋 Overall Feedback', 20, y);
        y += 8;

        drawRoundedRect(doc, 20, y, 170, 40, 4, COLORS.bgCard);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textSecondary);
        const fbLines = doc.splitTextToSize(scorecard.overallFeedback, 155);
        doc.text(fbLines.slice(0, 6), 28, y + 9);
    }

    // Interviewer Notes
    if (scorecard.interviewerNotes) {
        y += 50;
        if (y > 250) { y = addPage(doc); pageNum++; }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.accent);
        doc.text('🔒 Interviewer Notes (Private)', 20, y);
        y += 8;

        drawRoundedRect(doc, 20, y, 170, 30, 4, COLORS.bgCard);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...COLORS.textSecondary);
        const noteLines = doc.splitTextToSize(`"${scorecard.interviewerNotes}"`, 155);
        doc.text(noteLines.slice(0, 5), 28, y + 9);
    }

    drawFooter(doc, pageNum);

    // ── Save ──
    doc.save(`Mock_Interview_Scorecard_${config.role?.replace(/\s/g, '_') || 'Interview'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ─── Resume Analysis Report ────────────────────────────────────
export const generateResumeReport = (analysis, user) => {
    const doc = new jsPDF();
    let y = 0;

    doc.setFillColor(...COLORS.bgDark);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 210, 4, 'F');

    y = 25;
    drawRoundedRect(doc, 20, y, 38, 12, 3, COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('AI InterviewPrep', 22, y + 8);

    y = 48;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Resume Analysis', 20, y);
    y += 10;
    doc.setTextColor(...COLORS.primary);
    doc.text('Report', 20, y);

    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(`Candidate: ${user?.name || 'Student'}`, 20, y);
    y += 6;
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);

    y += 10;
    doc.setDrawColor(...COLORS.primary);
    doc.line(20, y, 190, y);

    // ATS Score
    y += 12;
    drawRoundedRect(doc, 20, y, 170, 32, 6, COLORS.bgCard);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textSecondary);
    doc.text('ATS Compatibility Score', 28, y + 12);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...getScoreColor(analysis.atsScore));
    doc.text(`${analysis.atsScore}/100`, 162, y + 14, { align: 'right' });
    drawGradientBar(doc, 28, y + 22, 140, 4, analysis.atsScore);

    y += 40;

    // Strengths
    const printList = (title, items, color, icon) => {
        if (!items?.length) return;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...color);
        doc.text(`${icon} ${title}`, 20, y);
        y += 7;
        items.forEach(item => {
            if (y > 270) { y = 20; doc.addPage(); doc.setFillColor(...COLORS.bgDark); doc.rect(0, 0, 210, 297, 'F'); }
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textPrimary);
            const lines = doc.splitTextToSize(`•  ${item}`, 160);
            doc.text(lines, 28, y);
            y += lines.length * 4 + 3;
        });
        y += 5;
    };

    printList('Strengths', analysis.strengths, COLORS.cyan, '💪');
    printList('Weaknesses', analysis.weaknesses, COLORS.danger, '⚠️');
    printList('Missing Skills', analysis.missingSkills, COLORS.yellow, '📌');
    printList('Improvements', analysis.improvements, COLORS.primary, '💡');

    drawFooter(doc, 1);
    doc.save(`Resume_Analysis_${user?.name?.replace(/\s/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
};
