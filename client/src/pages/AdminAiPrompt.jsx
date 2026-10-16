import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_COMPANY_KNOWLEDGE_BASE = `COMPANY IDENTITY:
الاسم الرسمي: ريفليكتو لحماية وتظليل وتطوير السيارات (Reflecto Premium Car Protection)
المجال: حماية وتظليل وتطوير السيارات، حلول حماية الطلاء، العزل الحراري، خدمات العناية بالسيارات.

EXCLUSIVE AGENCY:
ريفليكتو هي الوكيل الحصري الرسمي والوحيد في المملكة العربية السعودية لمنتجات وحلول شركة Apeax الامؤسكسه المتخصصة في تقنيات وبراءات اختراع حماية السيارات.

BRAND VISION:
"نبيعك ما نثق به، ونضمن لك ما نستطيع الالتزام به." — حماية بمستوى عسكري مع الحفاظ على لمسة صالة العرض.

STANDARDS & QUALIFICATIONS:
- بيئة خالية من الغبار معتمدة من آيزو (ISO).
- مواد عالية التقنية والجودة.
- فنيون خبراء معتمدون ومختصون.
- ضمان موثق وواقعي لمدة 5 سنوات على خدمات الحماية.

PRODUCTS & SERVICES DETAILS:
1. أفلام حماية الطلاء PPF (Paint Protection Film):
   - فيلم حماية شفاف قوي يُثبت على الطلاء لحمايته من الخدوش السطحية، الاحتكاكات، الحصى والدقائق الخارجية.
   - يتميز بخاصية التجدد الذاتي (Self-Healing) للخدوش السطحية بالحرارة.
   - يحافظ على لون ولمعان الطلاء الأصلي وقيمة السيارة.

2. النانو سيراميك (Nano Ceramic Coating 9H):
   - طبقة حماية سائلة فائقة الشفافية تُطبق على السطح بعد التجهيز والتلميع.
   - تعزز عمق اللمعان الزجاجي، وتقوم بمقاومة التصاق المياه والأوساخ والملوثات وتسهل عملية الغسيل.
   - تتوفر طبقات نانو سيراميك مخصصة للهيكل الخارجي، الجنوط، والمقصورة الداخلية.

3. العازل الحراري للسيارات (Apeax Thermal Insulation):
   - أفلام عازلة متخصصة تُثبت على زجاج السيارة من منتجات Apeax الامريكيه.
   - تعزل نسبة عالية تصل إلى 95% من الحرارة والأشعة فوق البنفسجية والأشعة تحت الحمراء الضارة.
   - تحمي ديكورات ومقصورة السيارة وتقليل الحمل على نظام التكييف.

4. تلميع وتصحيح الطلاء (Paint Polishing & Correction):
   - معالجة وتلميع احترافي لإزالة الخدوش السطحية ودوائر الغسيل والباستيل واستعادة بريق الطلاء.

5. كاميرات المراقبة للسيارات (Dashcam):
   - توريد وتركيب كاميرات مراقبة للسيارات احترافية (Dashcam).

WARRANTY EXPLANATION (لماذا ضمان 5 سنوات):
تمنح ريفليكتو ضمانًا رسمياً حتى 5 سنوات. اخترنا 5 سنوات كمدة واقعية وتحفظية تتناسب مع البيئة الخليجية شديدة الحرارة والتعرض القوي للأشعة فوق البنفسجية والغبار، للوفاء والالتزام التام بكفاءة الأداء طوال المدة بدلاً من تقديم أرقام تسويقية طويلة لا تصمد في الواقع.

PRICES & PACKAGES:
- تبدأ أسعار الباقات من 350 ريال سعودي.
- تختلف الأسعار والدراسة بحسب نوع السيارة وحجمها وموديلها ومساحة التغطية المطلوب حمايتها.

BRANCHES & CONTACT INFO:
▪️ جدة (الفيصلية - الفرع الرئيسي): +966 55 872 2444
▪️ الرياض (فرع الفيصلية 1، فرع الفيصلية 2)
▪️ مكة المكرمة: +966 53 533 2279
▪️ الطائف: +966 53 533 2279
▪️ المدينة المنورة: +966 55 872 2444
▪️ الدمام

BOOKING & APPOINTMENTS:
يمكن للعميل حجز موعد لسيارته من خلال الموقع الإلكتروني باختيار الخدمة والفرع المناسب، أو التواصل المباشر عبر الهاتف والواتساب مع الفروع.

LOYALTY PROGRAM:
برنامج نقاط الولاء في ريفليكتو بيسمح للعميل كسب نقاط مع كل حجز وسداد، واستبدال النقاط مباشرة بكوبونات خصم من لوحة تحكم حسابه.`;

const AdminAiPrompt = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_ai');
  const [promptText, setPromptText] = useState('');

  if (!canManage) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a] text-white">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
            <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
            <p className="text-xs text-gray-400">لا تملك صلاحية الوصول لإعدادات الذكاء الاصطناعي. تواصل مع السوبر أدمن للحصول على صلاحية (manage_ai).</p>
          </div>
        </main>
      </div>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['adminAiPrompt'],
    queryFn: async () => {
      const res = await api.get('/ai/prompt');
      return res?.prompt || res?.data?.prompt || '';
    },
  });

  useEffect(() => {
    if (data) setPromptText(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (newPrompt) => api.put('/ai/prompt', { prompt: newPrompt }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAiPrompt']);
      toast.success('تم حفظ قاعدة معرفة الشركة بنجاح في قاعدة البيانات');
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ أثناء حفظ البيانات'),
  });

  const handleSave = () => {
    if (!promptText.trim()) {
      toast.error('لا يمكن ترك قاعدة المعرفة فارغة');
      return;
    }
    saveMutation.mutate(promptText);
  };

  const handleResetDefault = () => {
    if (window.confirm('هل أنت تأكد من إعادة تعيين قاعدة المعرفة إلى بيانات الشركة الافتراضية المستخرجة من الموقع؟')) {
      setPromptText(DEFAULT_COMPANY_KNOWLEDGE_BASE);
      saveMutation.mutate(DEFAULT_COMPANY_KNOWLEDGE_BASE);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-400">smart_toy</span>
          قاعدة معرفة وبيانات الشركة للذكاء الاصطناعي (Company Knowledge Base)
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          يمكنك هنا إضافة وتعديل كافة البيانات والمعلومات الخاصة بالشركة (الفروع، الخدمات، الضمان، أرقام التواصل، والأسعار). يتم حفظ هذه البيانات مباشرة في قاعدة البيانات ليعتمد عليها المساعد الذكي في الإجابة وفق القواعد والتعليمات الصارمة.
        </p>

        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-indigo-300">
              قاعدة معرفة ومعلومات الشركة (Company Knowledge Base):
            </label>
            <button
              onClick={handleResetDefault}
              className="text-xs text-gray-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="إعادة التعيين لبيانات الموقع الافتراضية"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              إعادة التعيين للافتراضي
            </button>
          </div>

          {isLoading ? (
            <div className="text-gray-400 py-12 text-center flex justify-center items-center gap-2">
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              جاري جلب بيانات الذكاء الاصطناعي من قاعدة البيانات...
            </div>
          ) : (
            <>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={16}
                dir="rtl"
                placeholder="أدخل معلومات وبيانات الشركة التي سيعتمد عليها المساعد الذكي..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-white text-sm leading-relaxed outline-none focus:border-indigo-500 font-mono transition-colors"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-500">
                  * يتم حفظ النص تلقائيًا في جدول <code className="text-indigo-400">ai_settings</code> بقاعدة البيانات.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  {saveMutation.isPending ? 'جاري الحفظ بالداتابيز...' : 'حفظ التغيرات في الداتابيز'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAiPrompt;
