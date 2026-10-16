const { pool } = require('../config/database');

// ─── CORE SYSTEM PERSONA & BEHAVIOR INSTRUCTIONS ───────────────────
const CORE_SYSTEM_INSTRUCTIONS = `
أنت "مساعد ريفليكتو الذكي" (Reflecto AI Assistant) - مستشار العناية بالسيارات وحمايتها الفاخرة لشركة ريفليكتو (Reflecto Premium Car Protection)، الوكيل الحصري والوحيد بالمملكة العربية السعودية لمنتجات Apeax الامريكية.

شخصيتك وأسلوبك في الحوار والقيود:
- تتحدث باللغة العربية بأسلوب سعودي طبيعي، راقي، ودود، واحترافي.
- مهامك محددة فقط في: (1) الإجابة عن استفسارات العملاء والخدمات والأسعار وكيفية استخدام الموقع، و (2) إرسال طلب تواصل للفرع إذا طلب العميل ذلك. لا تنفذ أي إجراءات أخرى خارج هذا النطاق.
- إذا رغب العميل في أن يتواصل معه أحد ممثلي الفرع (طلب تواصل) أو قام بتزويدك ببياناته:
  1. إذا لم تكن البيانات مكتملة، اطلب منه تزويدك بما ينقص من: اسمه الكامل، رقم جواله، ونوع سيارته أو الخدمة المطلوبة.
  2. بمجرد توفر الاسم ورقم الجوال، قم **فوراً ومباشرةً وبدون طلب أي تأكيد من العميل** بإضافة الوسم الخاص في نهاية رسالتك بالشكل التالي بالضبط ليقوم النظام بتسجيل طلب التواصل فوراً:
     [SUBMIT_CONTACT: {"full_name": "الاسم", "phone": "05xxxxxxxx", "car_brand": "نوع السيارة", "service_type": "الخدمة المطلوبة"}]
  3. أبلغ العميل بركوب وسرعة إرسال طلبه وسيقوم ممثل الفرع بالتواصل معه قريباً.
- استخدم HTML أو الكلمات العريضة <b>...</b> عند إبراز العناوين والأسعار بشكل أنيق.

دليل استخدام الموقع والخدمات للعميل:
1. كيفية استخدام نقاط الولاء (Loyalty Points):
   - يكسب العميل نقاط ولاء تلقائياً مع كل خدمة أو طلب يتم إنجازه.
   - يمكن للعميل استعراض رصيد نقاطه وسجل العمليات من خلال "لوحة تحكم العميل" (Client Dashboard).
   - يتم استبدال النقاط خصومات ومكافآت حصرية عند طلب الخدمات.
2. كيفية متابعة تقدم الخدمة / تتبع السيارة (Vehicle Progress):
   - عند إدخال السيارة للمركز، يظهر شريط تقدم الخدمة مباشرة في "لوحة تحكم العميل".
   - تتحدث حالة الخدمة تلقائياً من (قيد الانتظار -> قيد التنفيذ -> جاهز للتسليم -> تم التسليم).
3. كيفية استعراض شهادات الضمان (Warranties):
   - يظهر قسم "الضمانات المفعّلة" في لوحة تحكم العميل فور تسليم السيارة وتفعيل الضمان من قبل الإدارة.
   - يوضح الضمان تاريخ البداية والنهاية ومدة الضمان لكل خدمة (عازل، نانو، PPF).

قاعدة معرفة الشركة والخدمات والباقات المتاحة:
`;

// ─── DEFAULT EXTRACTED COMPANY KNOWLEDGE BASE ───────────────────
const DEFAULT_COMPANY_KNOWLEDGE_BASE = `COMPANY IDENTITY:
الاسم الرسمي: ريفليكتو لحماية وتظليل وتطوير السيارات (Reflecto Premium Car Protection)
المجال: حماية وتظليل وتطوير السيارات، حلول حماية الطلاء، العزل الحراري، خدمات العناية بالسيارات.

EXCLUSIVE AGENCY:
ريفليكتو هي الوكيل الحصري الرسمي والوحيد في المملكة العربية السعودية لمنتجات وحلول شركة Apeax الامريكية.

PRODUCTS & SERVICES DETAILS:
1. أفلام حماية الطلاء PPF (Paint Protection Film):
   - فيلم حماية شفاف قوي يُثبت على الطلاء لحمايتها من الخدوش، الاحتكاكات، وحصى الطرق.
   - يتميز بخاصية التجدد الذاتي (Self-Healing) للخدوش السطحية بالحرارة أو الشمس.
   - يحافظ على لون ولمعان الطلاء الأصلي وقيمة السيارة.

2. النانو سيراميك (Nano Ceramic Coating 9H):
   - طبقة حماية سائلة تعزز عمق اللمعان الزجاجي وتجعل السطح طارداً للمياه والأتربة (Hydrophobic).
   - تتوفر للهيكل الخارجي، الجنوط، والمقصورة الداخلية.

3. العازل الحراري للسيارات (Apeax Thermal Insulation):
   - أفلام عازلة متخصصة تُثبت على زجاج السيارة من Apeax الامريكية.
   - تعزل نسبة عالية تصل إلى 96% من الحرارة والأشعة فوق البنفسجية وتخفف الحرارة داخل المقاعد.

BRANCHES & CONTACT INFO:
▪️ جدة (الفيصلية - الفرع الرئيسي): +966 55 872 2444
▪️ الرياض (فرع الفيصلية 1، فرع الفيصلية 2)
▪️ مكة المكرمة: +966 53 533 2279
▪️ الطائف: +966 53 533 2279
▪️ المدينة المنورة: +966 55 872 2444
▪️ الدمام

WARRANTY:
ضمان موثق وواقعي لمدة 5 سنوات على خدمات الحماية والعازل الحراري.`;

/**
 * Get current system prompt / knowledge base for AI Assistant
 */
async function getSystemPrompt(req, res) {
  try {
    const [[row]] = await pool.query(
      "SELECT setting_value FROM ai_settings WHERE key_name = 'grok_system_prompt'"
    );
    res.json({
      success: true,
      prompt: row && row.setting_value && row.setting_value.trim() ? row.setting_value : DEFAULT_COMPANY_KNOWLEDGE_BASE,
    });
  } catch (err) {
    console.error('Get AI Prompt error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Update system prompt / knowledge base for AI Assistant (Admin only)
 */
async function updateSystemPrompt(req, res) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Prompt content is required' },
    });
  }

  try {
    await pool.query(
      `INSERT INTO ai_settings (key_name, setting_value) VALUES ('grok_system_prompt', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [prompt.trim(), prompt.trim()]
    );

    res.json({
      success: true,
      message: 'تم تحديث قاعدة معرفة الذكاء الاصطناعي بنجاح',
    });
  } catch (err) {
    console.error('Update AI Prompt error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Pure LLM-driven Customer Chat Completion powered by Gemini & Fallback APIs
 */
async function chatCompletion(req, res) {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_MESSAGE', message: 'الرسالة مطلوبة / Message is required' },
    });
  }

  try {
    // 1. Fetch company knowledge base from DB or fallback
    const [[row]] = await pool.query(
      "SELECT setting_value FROM ai_settings WHERE key_name = 'grok_system_prompt'"
    ).catch(() => [[]]);
    let activeCompanyKnowledge = (row && row.setting_value && row.setting_value.trim()) ? row.setting_value : DEFAULT_COMPANY_KNOWLEDGE_BASE;

    // 2. Fetch live services & pricing packages from DB for comprehensive context
    const [services] = await pool.query(
      "SELECT id, name_ar, description_ar FROM services WHERE is_active = 1 ORDER BY id ASC"
    ).catch(() => [[]]);

    const [packages] = await pool.query(
      `SELECT pt.name_ar, pt.price, pt.currency, pt.warranty_years, pt.tagline_ar, pt.features_ar, s.name_ar AS service_category
       FROM pricing_tiers pt
       LEFT JOIN services s ON pt.service_id = s.id
       WHERE pt.client_id IS NULL
       ORDER BY pt.sort_order ASC, pt.id ASC`
    ).catch(() => [[]]);

    let dbDynamicContext = '\nقائمة الخدمات والباقات المتاحة بالشركة والأسعار الحية المحدثة:\n';
    if (services && services.length > 0) {
      dbDynamicContext += 'أولاً: الخدمات الأساسية المتاحة:\n';
      services.forEach((s, idx) => {
        dbDynamicContext += `${idx + 1}. خدمة ${s.name_ar}${s.description_ar ? ' (' + s.description_ar + ')' : ''}\n`;
      });
    }

    if (packages && packages.length > 0) {
      dbDynamicContext += '\nثانياً: الباقات والأسعار والضمان وتفاصيل المميزات:\n';
      packages.forEach((p, idx) => {
        let featuresList = [];
        if (p.features_ar) {
          try {
            featuresList = typeof p.features_ar === 'string' ? JSON.parse(p.features_ar) : p.features_ar;
          } catch (_) {
            featuresList = [];
          }
        }
        const featuresStr = Array.isArray(featuresList) && featuresList.length > 0 ? ` | المميزات: [${featuresList.join('، ')}]` : '';
        const categoryStr = p.service_category ? ` (تابعة لقسم: ${p.service_category})` : '';
        dbDynamicContext += `${idx + 1}. باقة "${p.name_ar}"${categoryStr}: السعر ${p.price} ${p.currency || 'ر.س'} | ضمان ${p.warranty_years ? p.warranty_years + ' سنوات' : 'حسب نوع الباقة'} | الوصف: ${p.tagline_ar || 'حماية متكاملة'}${featuresStr}\n`;
      });
    }

    const fullSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n${activeCompanyKnowledge}\n${dbDynamicContext}`;

    // 3. Build History and Messages Array
    const messages = [];

    if (Array.isArray(history) && history.length > 0) {
      // Keep up to last 10 messages for rich conversational context
      const recentHistory = history.slice(-10);
      recentHistory.forEach((h) => {
        if (h.role && h.content && h.content.trim()) {
          messages.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content.trim() }]
          });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', parts: [{ text: message.trim() }] });

    // 4. Primary Provider: Google Gemini API
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      const geminiModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];

      for (const gModel of geminiModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey.trim()}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: fullSystemPrompt }] },
              contents: messages,
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 3500
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              // Clean thinking tags and preserve line breaks
              reply = reply.replace(/\s*<think>[\s\S]*?(<\/think>|$)/gi, '').trim();

              // Check for [SUBMIT_CONTACT: {...}] tag
              const contactMatch = reply.match(/\[SUBMIT_CONTACT:\s*(\{[\s\S]*?\})\]/i);
              if (contactMatch) {
                try {
                  const contactData = JSON.parse(contactMatch[1]);
                  if (contactData.full_name && contactData.phone) {
                    await pool.query(
                      `INSERT INTO contact_requests (full_name, phone, car_brand, service_type, status, uuid)
                       VALUES (?, ?, ?, ?, 'new', UUID())`,
                      [contactData.full_name, contactData.phone, contactData.car_brand || 'غير محدد', contactData.service_type || 'طلب تواصل عام']
                    );
                  }
                } catch (e) {
                  console.error('Failed to parse AI contact tag:', e.message);
                }
                reply = reply.replace(/\[SUBMIT_CONTACT:\s*\{[\s\S]*?\}\]/gi, '').trim();
                reply += '\n\n✅ <b>تم تسجيل طلب التواصل بنجاح!</b> وسيقوم أحد ممثلي الفرع بالتواصل معك في أقرب وقت.';
              }

              return res.json({ success: true, reply, source: 'gemini_api' });
            }
          } else {
            const errText = await response.text().catch(() => '');
            console.warn(`[AI DIAGNOSTICS] Gemini Model ${gModel} status ${response.status}:`, errText.substring(0, 200));
          }
        } catch (err) {
          console.warn(`[AI DIAGNOSTICS] Gemini Model ${gModel} fetch error:`, err.message);
        }
      }
    }

    // 5. Secondary Provider: Groq / Grok API (OpenAI Compatible)
    const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (apiKey && apiKey.trim()) {
      const isGroq = apiKey.startsWith('gsk_');
      const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
      const modelsToTry = isGroq ? ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b'] : ['grok-beta'];

      const openAiMessages = [{ role: 'system', content: fullSystemPrompt }];
      messages.forEach(m => {
        openAiMessages.push({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.parts[0].text
        });
      });

      for (const model of modelsToTry) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ messages: openAiMessages, model, stream: false, temperature: 0.65, max_tokens: 800 }),
          });

          if (response.ok) {
            const data = await response.json();
            let reply = data.choices?.[0]?.message?.content;
            if (reply) {
              reply = reply.replace(/\s*<think>[\s\S]*?(<\/think>|$)/gi, '');
              reply = reply.split(/\r?\n/).filter(line => line.trim() !== '').join('\n\n').trim();

              const contactMatch = reply.match(/\[SUBMIT_CONTACT:\s*(\{[\s\S]*?\})\]/i);
              if (contactMatch) {
                try {
                  const contactData = JSON.parse(contactMatch[1]);
                  if (contactData.full_name && contactData.phone) {
                    await pool.query(
                      `INSERT INTO contact_requests (full_name, phone, car_brand, service_type, status, uuid)
                       VALUES (?, ?, ?, ?, 'new', UUID())`,
                      [contactData.full_name, contactData.phone, contactData.car_brand || 'غير محدد', contactData.service_type || 'طلب تواصل عام']
                    );
                  }
                } catch (e) {
                  console.error('Failed to parse AI contact tag:', e.message);
                }
                reply = reply.replace(/\[SUBMIT_CONTACT:\s*\{[\s\S]*?\}\]/gi, '').trim();
                reply += '\n\n✅ <b>تم تسجيل طلب التواصل بنجاح!</b> وسيقوم أحد ممثلي الفرع بالتواصل معك في أقرب وقت.';
              }

              return res.json({ success: true, reply, source: isGroq ? 'groq_api' : 'grok_api' });
            }
          }
        } catch (err) {
          console.warn(`[AI DIAGNOSTICS] Fallback model ${model} error:`, err.message);
        }
      }
    }

    // 6. Graceful fallback if no API key is available or all APIs are down
    return res.json({
      success: true,
      reply: 'أهلاً بك في ريفليكتو! 🚗✨ يسعدنا تواصلك معنا مباشرة عبر الواتساب أو عبر الاتصال بالفروع لإفادتك بأفضل الخدمات والباقات المناسبة لسيارتك.',
      source: 'fallback',
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = {
  getSystemPrompt,
  updateSystemPrompt,
  chatCompletion,
};
