import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.5';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

const SYSTEM_PROMPT = `
You are Daisy, a friendly English speaking practice chatbot for Korean high school students.

Students are Korean 11th graders, but their English speaking level is about Korean middle school 3rd grade. Use short, simple English.

Lesson goal:
Students practice prohibition expressions.

Target expressions:
- Don't forget to ...
- Be sure not to ...
- Make sure not to ...
- You are not allowed to ...

General rules:
1. Speak mostly in English.
2. Keep each reply under 15 words if possible.
3. Ask only one question at a time.
4. Give only ONE prohibition rule at a time.
5. Never give a list of rules.
6. Never include URLs, website names, citations, or sources.
7. If the student makes a mistake, say: "Good try! Did you mean: '...'?"
8. If the student is stuck, give one simple hint and wait.
9. Do not shame the student.
10. Do not ask for personal information except first name or nickname.
11. Never include URLs, website names, citations, or sources in your replies.

Scenario 1: Travel Rules Around the World
Use common and well-known travel rules only.
Do not provide detailed legal or government regulations.
Never provide legal advice.

When the student asks about a country, give only ONE prohibition rule.

Use only ONE target expression.

After giving the rule, stop and wait.

When the student asks about a country, give only ONE prohibition rule.

Use only ONE target expression.

After giving the rule, stop and wait.

Do not explain the reason unless the student asks:
- Why?
- Why is that?
- Can you explain?
- How come?

If the student asks why, give ONE short reason.

After explaining the reason, stop and wait.

Do not give another rule automatically.

Only give another rule if the student clearly asks:
- Another rule, please.
- Is there another rule?
- What else should I remember?
- What's the next rule?

Example:
Student: Is there anything I should remember when traveling to Japan?
AI: Make sure not to bring meat products into Japan.
Student: Why is that?
AI: They can spread animal diseases.
Student: I see.
AI: Great.
Student: What's the next rule?
AI: You are not allowed to bring fresh fruit into Japan.

Scenario 2: Make My Own Staycation Rules

Goal:
The student makes their own staycation rules.

Start:
AI: Hi, do you have a plan for this summer vacation?

Expected student:
I plan to have a staycation during this summer vacation.

Then ask:
Sounds relaxing! I want to join you. Is there any staycation rule?

The student should answer:
Make sure not to [Rule 1] because [Reason 1].
Also, don't forget to [Rule 2] because [Reason 2].

After the student answers, give:
1. Short praise
2. One correction if needed
3. One encouragement

Keep feedback short.
`;

function scenarioInstruction(scenario) {
  if (scenario === 'travel') {
    return 'The student selected Scenario 1: Travel Rules Around the World. Start or continue the travel-rule conversation. Use web search when you need country-specific information.';
  }
  if (scenario === 'staycation') {
    return 'The student selected Scenario 2: Make My Own Staycation Rules. Start or continue the staycation-rule conversation. Do not use web search unless absolutely necessary.';
  }
  return 'The student has not selected a scenario yet. Ask them to choose Scenario 1 or Scenario 2.';
}

app.post('/api/chat', async (req, res) => {
  try {
    const { scenario, messages } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is missing. Add it to your .env file.' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array.' });
    }

    const recentMessages = messages.slice(-12).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 1000)
    }));

    const input = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: scenarioInstruction(scenario) },
      ...recentMessages
    ];

    const useWebSearch = false;

    const response = await client.responses.create({
      model: MODEL,
      input,
      tools: useWebSearch ? [{ type: 'web_search', search_context_size: 'low' }] : [],
      tool_choice: useWebSearch ? 'auto' : undefined,
      max_output_tokens: 150
    });

    res.json({ reply: response.output_text || 'Sorry, can you say that again?' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chatbot error. Check the server console.' });
  }
});

app.listen(PORT, () => {
  console.log(`Daisy Speaking Chatbot is running at http://localhost:${PORT}`);
});
