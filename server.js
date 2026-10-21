const express = require("express");

const app = express();
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "minimax/minimax-m3.1-flash:free";

app.get("/", (_req, res) => {
  res.json({
    app: "Doctor Future 232+ AI Backend",
    status: "running",
    note: "Set OPENROUTER_API_KEY in the hosting provider's environment variables."
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: "AI is not configured yet. Add OPENROUTER_API_KEY in server environment variables."
      });
    }

    const { messages, question } = req.body || {};
    const incoming = Array.isArray(messages)
      ? messages.filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      : (typeof question === "string" && question.trim()
          ? [{ role: "user", content: question.trim() }]
          : []);

    if (!incoming.length) {
      return res.status(400).json({ error: "Send a non-empty question or a messages array." });
    }

    const systemPrompt = {
      role: "system",
      content: [
        "أنت مساعد تعليمي لتطبيق دكتور المستقبل 232+ لطلاب البكالوريا العلمي السوري.",
        "أجب باللغة العربية الواضحة، وفضّل المصطلحات المدرسية السورية.",
        "في المسائل العلمية: اكتب المعطيات، القانون، التعويض، الحساب خطوة بخطوة، ثم النتيجة مع الوحدة.",
        "تحقق من الحسابات ولا تقفز إلى نتيجة. إذا لم تكن متأكدًا أو كانت المعطيات ناقصة فقل ذلك بوضوح ولا تخترع.",
        "لا تدّعِ أن لديك وصولًا إلى كتاب أو منهاج أو فيديوهات المستخدم ما لم تُرسل محتوياتها ضمن الطلب.",
        "إذا طلب الطالب شرحًا مبسطًا، اشرح الفكرة بلغة سهلة ثم أعط مثالًا قصيرًا عند الحاجة."
      ].join("\n")
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://doctor-future-232.example",
        "X-Title": "Doctor Future 232+"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemPrompt, ...incoming],
        temperature: 0.2
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || `OpenRouter request failed (${response.status})`;
      return res.status(502).json({ error: detail });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "The AI provider returned an empty response." });
    }

    return res.json({
      answer: answer.trim(),
      model: data?.model || MODEL
    });
  } catch (error) {
    console.error("Chat route error:", error?.message || error);
    return res.status(500).json({ error: "Unexpected server error. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Doctor Future 232+ backend listening on port ${PORT}`);
});
