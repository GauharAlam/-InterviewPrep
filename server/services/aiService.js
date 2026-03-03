const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const getModel = () => {
  if (!model) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
};

// ─── Resume Analysis ───────────────────────────────────────────
const analyzeResume = async (resumeText) => {
  const m = getModel();
  const prompt = `You are an ATS system and technical recruiter.

Analyze the following resume text.

Give your response STRICTLY as a JSON object with this structure:
{
  "atsScore": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "technicalQuestions": [
    {"question": "...", "category": "..."},
    {"question": "...", "category": "..."},
    {"question": "...", "category": "..."},
    {"question": "...", "category": "..."},
    {"question": "...", "category": "..."}
  ],
  "behavioralQuestions": [
    {"question": "..."},
    {"question": "..."},
    {"question": "..."}
  ]
}

Do NOT include any explanatory text outside the JSON object.

Resume Text:
${resumeText}`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Question Generation ──────────────────────────────────────
const generateQuestions = async ({ role, level, skills }) => {
  const m = getModel();
  const prompt = `You are a technical interviewer. Generate interview questions.

Role: ${role}
Experience Level: ${level}
${skills ? `Candidate Skills: ${skills}` : ''}

Generate a JSON response with this structure:
{
  "technical": [
    {"question": "...", "difficulty": "easy|medium|hard", "topic": "..."},
    ...at least 5 questions
  ],
  "behavioral": [
    {"question": "...", "category": "..."},
    ...at least 3 questions
  ],
  "hr": [
    {"question": "...", "category": "..."},
    ...at least 2 questions
  ]
}

Do NOT include any explanatory text outside the JSON object.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Voice Answer Analysis ────────────────────────────────────
const analyzeVoiceAnswer = async (transcribedText, question) => {
  const m = getModel();
  const prompt = `Analyze this interview answer.

Question asked: ${question}

Evaluate:
1. Confidence level (0-10)
2. Clarity (0-10)
3. Communication skills (0-10)
4. Use of filler words (count and list them)
5. Sentiment (positive/neutral/negative)
6. Relevance to question (0-10)
7. Suggestions to improve

Return STRICTLY as JSON:
{
  "confidenceLevel": <number>,
  "clarity": <number>,
  "communicationSkills": <number>,
  "fillerWords": {"count": <number>, "words": ["um", "uh", ...]},
  "sentiment": "positive|neutral|negative",
  "relevance": <number>,
  "overallScore": <number 0-100>,
  "suggestions": ["suggestion1", "suggestion2", ...],
  "feedback": "brief overall feedback paragraph"
}

Do NOT include any explanatory text outside the JSON object.

Answer:
${transcribedText}`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Code Evaluation ──────────────────────────────────────────
const evaluateCode = async (problemStatement, userCode, testResults) => {
  const m = getModel();
  const prompt = `Evaluate this coding solution.

Check:
1. Correctness
2. Time complexity
3. Space complexity
4. Optimization level
5. Code quality
6. Suggestions for improvement

Return STRICTLY as JSON:
{
  "correctness": "description",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "optimizationLevel": "optimal|good|needs-improvement|poor",
  "codeQuality": "description",
  "score": <number 0-100>,
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Do NOT include any explanatory text outside the JSON object.

Problem:
${problemStatement}

User Code:
${userCode}

Test Case Results:
${JSON.stringify(testResults)}`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Smart Mock Interview Chat ────────────────────────────────
const mockInterviewChat = async (messages, role, config = {}) => {
  const m = getModel();
  const history = messages.map(msg => `${msg.role === 'candidate' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n\n');
  const questionCount = messages.filter(m => m.role === 'interviewer').length;
  const totalQuestions = config.totalQuestions || 8;
  const difficulty = config.difficulty || 'mixed';
  const interviewType = config.interviewType || 'technical';

  const prompt = `You are an experienced, friendly but thorough ${role} interviewer at a top tech company.

INTERVIEW CONFIG:
- Role: ${role}
- Interview Type: ${interviewType} (technical / behavioral / mixed)
- Difficulty: ${difficulty}
- Questions asked so far: ${questionCount} out of ${totalQuestions} planned
- Company style: Professional but conversational

YOUR INTERVIEWING RULES:
1. **Follow-up on weak answers**: If the candidate gives a vague, incomplete, or incorrect answer, DO NOT move on. Ask a clarifying follow-up like "Can you elaborate on that?" or "What specifically do you mean by...?" or "Let's dig deeper into this."
2. **Probe knowledge gaps**: If you detect the candidate doesn't fully understand a concept, ask a related simpler question to gauge their true understanding.
3. **Acknowledge good answers**: When the candidate gives a strong answer, briefly acknowledge it ("Great answer!") before moving to the next topic.
4. **Progressive difficulty**: Start with easier questions and increase difficulty as the interview progresses.
5. **Mix question types**: Include a mix of conceptual, practical/scenario-based, and problem-solving questions.
6. **Stay on topic**: Questions should be relevant to the ${role} role.
7. **Natural conversation**: Make it feel like a real interview, not a quiz. Use transitions.
8. **Time awareness**: You're on question ~${questionCount}/${totalQuestions}. ${questionCount >= totalQuestions ? 'This is the LAST question. After the candidate answers, thank them and say the interview is complete. Add [INTERVIEW_COMPLETE] at the very end of your message.' : ''}

${questionCount === 0 ? 'This is the START of the interview. Introduce yourself briefly (use a realistic name like "Alex" or "Priya"), mention the company, explain the interview format, and ask your FIRST question.' : ''}

CONVERSATION SO FAR:
${history || 'None - this is the beginning.'}

Respond ONLY as the interviewer. Be concise but natural. One question at a time.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
};

// ─── Generate Interview Scorecard ─────────────────────────────
const generateInterviewScorecard = async (messages, role) => {
  const m = getModel();
  const history = messages.map(msg => `${msg.role === 'candidate' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n\n');

  const prompt = `You are an expert interview evaluator. Analyze this complete mock interview transcript and generate a comprehensive scorecard.

Interview Role: ${role}

FULL TRANSCRIPT:
${history}

Evaluate the candidate and return STRICTLY as JSON:
{
  "overallScore": <number 0-100>,
  "verdict": "Strong Hire" | "Hire" | "Lean Hire" | "Lean No Hire" | "No Hire",
  "categories": {
    "technicalKnowledge": {
      "score": <number 0-10>,
      "feedback": "specific feedback about their technical depth"
    },
    "problemSolving": {
      "score": <number 0-10>,
      "feedback": "how well they approached problems"
    },
    "communication": {
      "score": <number 0-10>,
      "feedback": "clarity, structure, articulation"
    },
    "depthOfKnowledge": {
      "score": <number 0-10>,
      "feedback": "did they go beyond surface-level answers?"
    },
    "practicalExperience": {
      "score": <number 0-10>,
      "feedback": "real-world application of concepts"
    }
  },
  "questionAnalysis": [
    {
      "question": "the question that was asked",
      "answerQuality": "strong" | "adequate" | "weak" | "missed",
      "feedback": "specific feedback on this answer"
    }
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "topicsToStudy": ["topic1", "topic2", "topic3", "topic4"],
  "overallFeedback": "A 3-4 sentence paragraph giving overall impression and top advice",
  "interviewerNotes": "What a real interviewer would write in their notes about this candidate"
}

Be honest and specific. Do NOT include any text outside the JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Improvement Plan ─────────────────────────────────────────
const generateImprovementPlan = async (scores) => {
  const m = getModel();
  const prompt = `Based on these interview scores, create a personalized improvement plan.

Scores:
- Resume/ATS Score: ${scores.resumeScore}/100
- Coding Score: ${scores.codingScore}/100
- Communication Score: ${scores.communicationScore}/100
- Overall Score: ${scores.overallScore}/100

Return STRICTLY as JSON:
{
  "plan": [
    {"area": "...", "suggestion": "...", "priority": "high|medium|low"},
    ...at least 5 items
  ],
  "summary": "brief paragraph summarizing the plan"
}

Do NOT include any explanatory text outside the JSON object.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Study Plan Generator ─────────────────────────────────────
const generateStudyPlan = async ({ targetCompany, targetRole, interviewDate, currentSkills, experienceLevel, hoursPerDay }) => {
  const m = getModel();
  const today = new Date();
  const interview = new Date(interviewDate);
  const daysLeft = Math.max(1, Math.ceil((interview - today) / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.ceil(daysLeft / 7);

  const prompt = `You are an expert interview coach and career mentor. Create a detailed, personalized study plan.

STUDENT PROFILE:
- Target Company: ${targetCompany || 'General tech company'}
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Current Skills: ${currentSkills?.join(', ') || 'Not specified'}
- Hours available per day: ${hoursPerDay}
- Days until interview: ${daysLeft} (${weeksLeft} weeks)
- Interview Date: ${interview.toLocaleDateString()}

IMPORTANT RULES:
1. The plan must fit EXACTLY within ${daysLeft} days
2. Group into weeks. Each week has a theme/focus area
3. Each day has specific topics, resources, and practice tasks
4. Earlier weeks = fundamentals; later weeks = advanced + mock interviews
5. Last 2-3 days should be revision + rest + mock interviews
6. If targeting a specific company, include company-specific prep tips
7. Be realistic about what can be covered given the time
8. Include a mix of theory, coding practice, and soft skills

Return STRICTLY as JSON:
{
  "summary": "2-3 sentence overview of the plan strategy",
  "totalDays": ${daysLeft},
  "totalWeeks": ${weeksLeft},
  "companyTips": ["tip1 about ${targetCompany}", "tip2", "tip3"],
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Week theme like 'Data Structures Fundamentals'",
      "days": [
        {
          "dayNumber": 1,
          "date": "YYYY-MM-DD",
          "focus": "Main topic for the day",
          "tasks": [
            {
              "title": "Task title",
              "type": "theory|practice|project|mock|revision",
              "duration": "1.5 hours",
              "description": "What to study or do",
              "resources": ["YouTube: ...", "LeetCode: ...", "Article: ..."]
            }
          ],
          "tip": "Quick pro tip for the day"
        }
      ]
    }
  ],
  "milestones": [
    {"day": 7, "title": "Complete arrays and strings", "check": "Can solve medium array problems"},
    {"day": 14, "title": "...", "check": "..."}
  ]
}

Do NOT include any text outside the JSON. Make dates start from ${today.toISOString().split('T')[0]}.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── Company Interview Profile ────────────────────────────────
const generateCompanyProfile = async ({ company, role }) => {
  const m = getModel();
  const prompt = `You are an expert career coach who has helped hundreds of candidates crack interviews at top companies. Generate a comprehensive interview preparation profile.

Company: ${company}
Target Role: ${role || 'Software Engineer'}

Return STRICTLY as JSON:
{
  "company": "${company}",
  "overview": "2-3 sentence description of the company and its interview culture",
  "difficulty": "Easy|Medium|Hard|Very Hard",
  "avgSalary": "salary range for this role in INR LPA or USD",
  "interviewRounds": [
    {
      "roundNumber": 1,
      "name": "Round name (e.g., Online Assessment)",
      "type": "online-test|phone-screen|technical|system-design|behavioral|hr|culture-fit",
      "duration": "45-60 mins",
      "description": "What happens in this round",
      "tips": ["tip1", "tip2"]
    }
  ],
  "interviewProcess": {
    "totalDuration": "2-4 weeks",
    "numberOfRounds": 4,
    "hasOnlineTest": true,
    "hasSystemDesign": false,
    "hasCodingRound": true,
    "hasTakeHome": false
  },
  "keyTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "companyValues": ["value1", "value2", "value3"],
  "interviewTips": [
    "Specific tip for cracking this company's interview",
    "Another tip",
    "Another tip"
  ],
  "commonMistakes": ["mistake1", "mistake2", "mistake3"],
  "questions": {
    "technical": [
      {"question": "...", "difficulty": "easy|medium|hard", "topic": "..."},
      ...at least 6 questions
    ],
    "behavioral": [
      {"question": "...", "tip": "How to answer this well"},
      ...at least 4 questions
    ],
    "hr": [
      {"question": "...", "tip": "..."},
      ...at least 3 questions
    ]
  },
  "resources": [
    {"name": "Resource name", "type": "website|youtube|book|course", "description": "Why this helps"}
  ],
  "pastExperiences": [
    "Brief 1-2 line interview experience summary from a candidate perspective"
  ]
}

Be accurate and specific to ${company}. Do NOT include any text outside the JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};
// ─── AI Practice: Generate Question ─────────────────────────
const generatePracticeQuestion = async ({ topic, difficulty, company, previousQuestions }) => {
  const m = getModel();
  const prevList = previousQuestions?.length
    ? `\n\nDo NOT repeat these already asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const prompt = `You are a technical interviewer preparing a practice question.

Topic: ${topic}
Difficulty: ${difficulty}
${company ? `Company Style: ${company} (tailor the question to this company's interview style)` : ''}
${prevList}

Generate a single interview question. Return STRICTLY as JSON:
{
  "question": "The interview question text",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "hints": ["hint1 if student is stuck", "hint2"],
  "keyPoints": ["key point the answer should cover", "another key point", "another key point"]
}

Do NOT include any text outside the JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

// ─── AI Practice: Evaluate Answer ───────────────────────────
const evaluatePracticeAnswer = async ({ question, answer, topic, difficulty }) => {
  const m = getModel();
  const prompt = `You are an expert technical interviewer evaluating a student's spoken answer.

Question: ${question}
Topic: ${topic}
Difficulty: ${difficulty}

Student's Answer (transcribed from voice):
"${answer}"

Evaluate thoroughly and return STRICTLY as JSON:
{
  "score": <number 0-10>,
  "verdict": "Excellent" | "Good" | "Average" | "Needs Improvement" | "Poor",
  "correctParts": ["what the student got right"],
  "missingParts": ["what the student missed"],
  "improvements": ["specific suggestion to improve"],
  "idealAnswer": "A concise but complete ideal answer (2-4 sentences)",
  "feedback": "A brief encouraging feedback paragraph (2-3 sentences). Be specific about what was good and what needs work.",
  "confidence": <number 0-10 based on how confident the answer sounded>,
  "clarity": <number 0-10 based on how clearly the answer was structured>
}

Be fair but honest. If the answer is blank or irrelevant, score accordingly. Do NOT include any text outside the JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
};

module.exports = {
  analyzeResume,
  generateQuestions,
  analyzeVoiceAnswer,
  evaluateCode,
  mockInterviewChat,
  generateInterviewScorecard,
  generateImprovementPlan,
  generateStudyPlan,
  generateCompanyProfile,
  generatePracticeQuestion,
  evaluatePracticeAnswer
};

