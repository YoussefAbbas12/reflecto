import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AboutSeeda = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('about-seeda');

  // Sidebar navigation items matching the screenshot
  const sidebarLinks = [
    { id: 'home', label: 'الرئيسية', icon: 'home', path: '/admin' },
    { id: 'about-seeda', label: 'ما هو نظام سيدا؟', icon: 'help_outline', path: '/about-seeda', active: true },
    { id: 'clients', label: 'العملاء', icon: 'group', path: '/admin/clients' },
    { id: 'operations', label: 'العمليات', icon: 'assignment', path: '/admin/orders' },
    { id: 'appointments', label: 'المواعيد', icon: 'calendar_month', path: '/admin/scheduling' },
    { id: 'warranties', label: 'الضمانات الإلكترونية', icon: 'verified_user', path: '/admin/billing' },
    { id: 'technicians', label: 'الفنيون والعمولات', icon: 'badge', path: '/admin/employees' },
    { id: 'reports', label: 'التقارير', icon: 'bar_chart', path: '/admin/overview' },
  ];

  // The 12 Main Modules from user's exact specification
  const modules = [
    {
      num: '01',
      title: 'إدارة العملاء والمركبات (CRM)',
      icon: 'person_pin',
      desc: 'قاعدة بيانات مركزية لجميع العملاء ومركباتهم، تتيح للموظفين الوصول إلى المعلومات وسجل الخدمات والتواصل السابق بسهولة.',
      bullets: [
        'ملف مستقل لكل عميل مع بيانات التواصل.',
        'تسجيل عدة مركبات لكل عميل، مع رقم اللوحة والموديل والسنة.',
        'سجل كامل للخدمات السابقة والضمانات والمبالغ.',
        'تصنيف العملاء حسب نوع العميل وقيمته ومعدل الزيارة.',
        'تسجيل مصدر العميل: اتصال، واتساب، حملة تسويقية أو زيارة مباشرة.',
        'متابعة العملاء المحتملين والعروض المرسلة وحالات البيع.',
        'تذكيرات المتابعة وإعادة استهداف العملاء غير النشطين.'
      ],
      image: '/assets/photo/landing-page.jpeg'
    },
    {
      num: '02',
      title: 'إدارة العمليات وأوامر العمل',
      icon: 'build_circle',
      desc: 'تحويل كل سيارة تدخل المركز إلى عملية منظمة يمكن تتبعها من الاستقبال حتى التسليم.',
      bullets: [
        'إنشاء أمر عمل مرتبط بالعميل والمركبة.',
        'تحديد الخدمات المطلوبة والكميات والأسعار والخصومات.',
        'تسجيل حالة السيارة عند الاستلام والملاحظات والصور.',
        'تحديد الفني المسؤول وفريق التنفيذ والفرع.',
        'متابعة مراحل العمل: مجدول، قيد التنفيذ، فحص الجودة، جاهز للتسليم، مكتمل.',
        'تسجيل الملاحظات الفنية والمواد المستخدمة ووقت التنفيذ.',
        'توثيق صور قبل الخدمة وبعدها.',
        'تسجيل اعتماد العميل على الأعمال الإضافية عند الحاجة.',
        'حفظ سجل العملية للرجوع إليه مستقبلًا.'
      ],
      image: '/assets/photo/landing services.jpeg'
    },
    {
      num: '03',
      title: 'إدارة الضمانات الإلكترونية (E-Warranty)',
      icon: 'verified',
      desc: 'إدارة الضمانات بطريقة رقمية مرتبطة بالخدمة والمركبة والعميل، بدلًا من الاعتماد على المستندات الورقية المتفرقة.',
      bullets: [
        'إصدار ضمان إلكتروني لكل خدمة مؤهلة.',
        'تحديد مدة الضمان وتاريخ البداية والانتهاء.',
        'إنشاء رقم ضمان فريد ورابط للتحقق من بياناته.',
        'تحديد نوع الخدمة والمنتج المستخدم وتفاصيل التغطية.',
        'ربط الضمان بالمركبة والعميل وأمر العمل.',
        'إرسال نسخة رقمية للعميل.',
        'متابعة الضمانات السارية والقريبة من الانتهاء والمنتهية.',
        'جدولة الفحوصات الدورية والتنبيهات للعملاء.',
        'تسجيل مطالبات الضمان وحالات الفحص والصيانة.'
      ],
      note: 'ميزة مهمة: إذا حصلت المركبة على حماية PPF وعزل حراري ونانو سيراميك، يمكن إدارة ضمان مستقل لكل خدمة، بشروط ومدد مختلفة.',
      image: '/assets/photo/car.jpg'
    },
    {
      num: '04',
      title: 'إدارة طلبات التواصل والذكاء الاصطناعي (AI Lead Management)',
      icon: 'smart_toy',
      desc: 'استقبال طلبات العملاء وتسجيلها وتحويلها إلى فرص بيع قابلة للمتابعة، مع إمكانية استخدام الذكاء الاصطناعي لتقليل العمل اليدوي.',
      bullets: [
        'تسجيل طلبات التواصل الواردة من القنوات المدعومة.',
        'حفظ اسم العميل ورقم التواصل والمركبة والخدمة المطلوبة.',
        'تصنيف الطلبات حسب نوع الخدمة والفرع والأولوية.',
        'تلخيص المحادثات واستخراج المعلومات الأساسية آليًا.',
        'تحويل الاستفسار إلى فرصة بيع داخل النظام.',
        'إسناد الطلب إلى موظف المبيعات المختص.',
        'متابعة حالة الطلب: جديد، قيد التواصل، عرض سعر، تم الحجز، مكتمل أو مفقود.',
        'كشف الطلبات التي لم يتم الرد عليها.',
        'قياس معدل التحويل من استفسار إلى حجز ثم إلى عملية بيع.',
        'إعداد تقارير عن مصادر العملاء الأكثر تحقيقًا للمبيعات.'
      ],
      extraParagraph: 'ويمكن توسيع الوحدة لتشمل مساعدًا ذكيًا يجيب عن الأسئلة المتكررة حول الخدمات والأسعار، ويجمع بيانات العميل ويقترح المواعيد المتاحة وفق قواعد النظام.',
      note: 'ملاحظة: التسجيل التلقائي للمكالمات والرسائل، والرد الآلي عبر واتساب أو الهاتف، يعتمد على تكاملات القنوات والصلاحيات التي يتم تفعيلها.',
      image: '/assets/photo/window-tint.jpg'
    },
    {
      num: '05',
      title: 'إدارة الخدمات والباقات والأسعار',
      icon: 'sell',
      desc: 'إنشاء قائمة موحدة بالخدمات والباقات التي يقدمها المركز، مع التحكم في الأسعار والتفاصيل والصلاحيات.',
      bullets: [
        'تعريف الخدمات الفردية والباقات المركبة.',
        'تصنيف الخدمات: حماية الطلاء، العزل الحراري، النانو سيراميك وغيرها.',
        'تحديد الأسعار حسب فئة السيارة وحجمها ونوع الخدمة.',
        'إنشاء باقات متعددة المستويات.',
        'تحديد مدة التنفيذ المتوقعة لكل خدمة.',
        'تحديد المواد أو المنتجات المستخدمة عند الحاجة.',
        'إدارة العروض والخصومات وتواريخ صلاحيتها.',
        'تحديد أسعار خاصة لفروع أو شرائح عملاء محددة.',
        'التحكم في صلاحية الموظفين لتعديل الأسعار أو اعتماد الخصومات.',
        'تحليل أكثر الخدمات والباقات مبيعًا وربحية.'
      ],
      extraParagraph: 'ويمكن إعداد باقات تجمع أكثر من خدمة، مع احتساب السعر الإجمالي ومتابعة تنفيذ كل خدمة ضمن الباقة.',
      image: '/assets/photo/nano-services.jpg'
    },
    {
      num: '06',
      title: 'إدارة المواعيد والحجوزات',
      icon: 'calendar_today',
      desc: 'تنظيم جدول العمل اليومي ومنع تضارب المواعيد وتوزيع الأحمال على الفروع والفنيين.',
      bullets: [
        'إنشاء الحجوزات وتعديلها وإلغاؤها.',
        'عرض تقويم يومي وأسبوعي وشهري.',
        'ربط الموعد بالعميل والمركبة والخدمات المطلوبة.',
        'تحديد الفرع ووقت الوصول ومدة التنفيذ المتوقعة.',
        'مراعاة توافر الفنيين ومساحات العمل أو المعدات عند تهيئة النظام لذلك.',
        'إرسال تأكيدات وتذكيرات بالمواعيد عبر القنوات المتاحة.',
        'إدارة التأخير وعدم الحضور وإعادة الجدولة.',
        'متابعة نسبة إشغال المواعيد والطاقة التشغيلية لكل فرع.',
        'قياس نسبة الحضور والإلغاء والتحويل إلى مبيعات.'
      ],
      image: '/assets/photo/level heat protection1.jpeg'
    },
    {
      num: '07',
      title: 'إدارة الفنيين والموظفين',
      icon: 'engineering',
      desc: 'ربط الموارد البشرية بالتشغيل الفعلي، بحيث تكون مسؤوليات كل موظف ونتائج عمله واضحة.',
      bullets: [
        'إنشاء ملفات للفنيين والموظفين.',
        'تحديد الوظيفة والفرع والمشرف المباشر.',
        'توزيع أوامر العمل على الفنيين أو فرق التنفيذ.',
        'متابعة المهام المسندة والمنجزة والمتأخرة.',
        'قياس عدد السيارات والخدمات المنفذة لكل فني.',
        'تسجيل أوقات بدء العمل والانتهاء منه.',
        'توثيق ملاحظات الجودة وإعادة العمل.',
        'تحديد الصلاحيات بحسب الدور الوظيفي.',
        'إعداد تقارير الإنتاجية والأداء الفردي والجماعي.'
      ],
      image: '/assets/photo/after heat protection.jpeg'
    },
    {
      num: '08',
      title: 'إدارة العمولات والحوافز',
      icon: 'payments',
      desc: 'احتساب مستحقات الموظفين والفنيين بناءً على قواعد محددة مسبقًا، بدلًا من الحساب اليدوي.',
      bullets: [
        'تحديد عمولة ثابتة أو نسبة مئوية لكل خدمة.',
        'إعداد قواعد مختلفة للفنيين ومندوبي المبيعات ومشرفي الفروع.',
        'احتساب العمولة بحسب قيمة الخدمة أو عدد العمليات أو تحقيق الأهداف.',
        'توزيع عمولة العملية بين أكثر من موظف وفق قواعد معتمدة.',
        'دعم الحوافز المرتبطة بالمبيعات الإضافية.',
        'مراعاة الخصومات والإلغاءات والمبالغ المستردة وفق سياسة الشركة.',
        'مراجعة العمولات واعتمادها قبل الصرف.',
        'إصدار كشف عمولات لكل موظف ولكل فترة.',
        'مقارنة أداء الموظفين وعمولاتهم بالإيرادات المحققة.'
      ],
      note: 'مثال: إذا كانت عمولة الفني 5% من قيمة خدمة مؤهلة بقيمة 2,000 ريال، فإن العمولة تساوي 100 ريال، قبل تطبيق أي شروط أو استقطاعات مقررة في سياسة الشركة.',
      image: '/assets/photo/service/ppf-after.jpg'
    },
    {
      num: '09',
      title: 'إدارة الفروع والأداء التشغيلي',
      icon: 'store',
      desc: 'لوحة مركزية تمنح الإدارة رؤية موحدة للأعمال، مع الاحتفاظ بتفاصيل كل فرع.',
      bullets: [
        'إضافة الفروع وتحديد مديريها وموظفيها.',
        'عرض المواعيد وأوامر العمل لكل فرع.',
        'مقارنة الإيرادات وعدد العمليات ومتوسط قيمة الفاتورة.',
        'قياس أداء الفنيين وموظفي المبيعات.',
        'متابعة الحجوزات والعمليات المتأخرة.',
        'تحليل مزيج الخدمات والباقات الأكثر طلبًا.',
        'تحديد صلاحيات الاطلاع والتعديل بحسب الفرع.',
        'إصدار تقارير مجمعة للشركة وتقارير مستقلة لكل موقع.',
        'مقارنة الأداء بين الفروع خلال فترات زمنية مختلفة.'
      ],
      image: '/assets/projects/autohub_1.jpg'
    },
    {
      num: '10',
      title: 'الفواتير والمدفوعات والتقارير المالية',
      icon: 'receipt_long',
      desc: 'ربط البيانات المالية بالعمليات لتوضيح المبالغ المستحقة والمدفوعة والمتبقية.',
      bullets: [
        'تسجيل قيمة الخدمة والخصومات والضريبة بحسب إعدادات النظام.',
        'متابعة الدفعات المقدمة والمبالغ المتبقية.',
        'تسجيل وسائل الدفع وحالة التحصيل.',
        'عرض الفواتير المدفوعة والمعلقة والمتأخرة.',
        'إعداد تقارير المبيعات والتحصيل حسب الفرع والفترة.',
        'متابعة الخصومات والمرتجعات والتسويات.',
        'ربط البيانات بأنظمة محاسبية خارجية عند الحاجة.',
        'إمكانية التكامل مع أنظمة الفوترة الإلكترونية المعتمدة وفق المتطلبات التقنية والتنظيمية.'
      ],
      note: 'يجب التمييز بين متابعة الإيرادات والتحصيل داخل النظام وبين المحاسبة الكاملة التي تشمل القيود والأستاذ العام والمصروفات والتسويات والقوائم المالية. الأخيرة تحتاج إلى وحدة محاسبية فعلية أو تكامل محاسبي موثوق.',
      image: '/assets/photo/view-3d-car.jpg'
    },
    {
      num: '11',
      title: 'إدارة المخزون والمواد',
      icon: 'inventory_2',
      desc: 'مراقبة المواد المستخدمة في الخدمات وتقليل الفاقد وتحسين ضبط التكلفة.',
      bullets: [
        'تعريف المنتجات والخامات والموردين.',
        'متابعة الأرصدة وحركات الصرف والإضافة.',
        'ربط المواد بأوامر العمل عند توفر بيانات الاستهلاك.',
        'متابعة مخزون كل فرع والمستودع المركزي.',
        'إصدار تنبيهات عند انخفاض المخزون.',
        'تسجيل التحويلات بين الفروع.',
        'متابعة المشتريات وتكاليف المواد.',
        'مقارنة الاستهلاك الفعلي بالاستهلاك المتوقع.',
        'تحليل تكلفة المواد لكل خدمة أو باقة.'
      ],
      note: 'وتكتسب هذه الوحدة أهمية خاصة في خدمات أفلام حماية الطلاء والعزل الحراري، حيث يمكن أن يؤثر استهلاك الخامات والهدر في هامش الربح.',
      image: '/assets/photo/levels heat protection.jpeg'
    },
    {
      num: '12',
      title: 'التقارير ولوحات المعلومات (Dashboard & Analytics)',
      icon: 'analytics',
      desc: 'تحويل بيانات التشغيل إلى مؤشرات تساعد الإدارة على اكتشاف المشكلات والفرص.',
      bullets: [
        'إجمالي المبيعات والتحصيل خلال الفترة.',
        'عدد السيارات والعمليات المكتملة.',
        'متوسط قيمة العملية لكل عميل.',
        'معدل تحويل طلبات التواصل إلى حجوزات ومبيعات.',
        'نسبة إشغال المواعيد والطاقة التشغيلية.',
        'أكثر الخدمات والباقات مبيعًا.',
        'العمولات المستحقة لكل موظف.',
        'الضمانات القريبة من الانتهاء.',
        'الطلبات المتأخرة التي تحتاج إلى متابعة.',
        'مقارنة أداء الفروع والفنيين ومندوبي المبيعات.',
        'تصدير التقارير حسب الصلاحيات والفترات المحددة.'
      ],
      image: '/assets/photo/ppf.jpeg'
    }
  ];

  // Section 2: Operational Workflow (8 Steps)
  const workflowSteps = [
    {
      num: '01',
      title: 'استقبال طلب العميل',
      desc: 'تسجيل الطلب يدويًا أو استقباله عبر قناة متكاملة مع النظام، مع حفظ مصدره وتفاصيله.'
    },
    {
      num: '02',
      title: 'تحديد الخدمة وإرسال العرض',
      desc: 'اختيار الباقة والسعر المناسبين وربطهما بملف العميل ومركبته.'
    },
    {
      num: '03',
      title: 'إنشاء الحجز',
      desc: 'تحديد الفرع والموعد والموارد المطلوبة وإرسال التأكيد.'
    },
    {
      num: '04',
      title: 'فتح أمر العمل',
      desc: 'تسجيل حالة السيارة وإسناد الخدمة إلى الفني أو الفريق المختص.'
    },
    {
      num: '05',
      title: 'التنفيذ وفحص الجودة',
      desc: 'متابعة مراحل العمل وتوثيق الصور والمواد والملاحظات.'
    },
    {
      num: '06',
      title: 'إتمام البيع والتحصيل',
      desc: 'تسجيل الفاتورة والمدفوعات والمبلغ المتبقي.'
    },
    {
      num: '07',
      title: 'إصدار الضمان واحتساب العمولة',
      desc: 'إنشاء الضمان المؤهل واحتساب العمولة طبقًا للقواعد المعتمدة.'
    },
    {
      num: '08',
      title: 'المتابعة وتحليل الأداء',
      desc: 'جدولة المتابعة وعرض نتائج العملية ضمن تقارير الفرع والإدارة.'
    }
  ];

  // Section 3: Extra Features
  const extraFeatures = [
    {
      title: 'مساعد ذكي للإدارة',
      desc: 'الاستفسار باللغة الطبيعية عن المبيعات والعمليات والضمانات والطلبات المتأخرة، بشرط أن يكون المساعد متصلًا ببيانات النظام ومصرحًا له بالوصول إليها.',
      icon: 'neurology'
    },
    {
      title: 'تجربة رقمية للعميل',
      desc: 'إتاحة روابط للعروض والضمانات والمستندات، وإمكانية توفير بوابة للعميل لمتابعة خدماته ومواعيده وضماناته.',
      icon: 'smartphone'
    },
    {
      title: 'الصلاحيات وسجل التدقيق',
      desc: 'تحديد ما يستطيع كل مستخدم الاطلاع عليه أو تعديله، مع تسجيل التغييرات المهمة، مثل تعديل الأسعار واعتماد الخصومات وتغيير حالة الضمان.',
      icon: 'shield_person'
    },
    {
      title: 'قابلية التوسع',
      desc: 'تصميم النظام ليستوعب منشأة واحدة أو شبكة فروع، مع إمكانية تخصيص الخدمات والصلاحيات والإعدادات لكل شركة.',
      icon: 'hub'
    },
    {
      title: 'التكامل مع الأنظمة الأخرى',
      desc: 'قابلية الربط مع مزودي الرسائل وواتساب، وأنظمة المحاسبة والفوترة، وخدمات الدفع، بحسب توفر واجهات الربط ومتطلبات كل مزود.',
      icon: 'sync_alt'
    }
  ];

  // Section 4: Traditional vs SEEDA Comparison
  const comparisons = [
    {
      aspect: 'إدارة العملاء',
      traditional: 'بيانات أساسية',
      seeda: 'سجل العميل والمركبة وتاريخ الخدمات'
    },
    {
      aspect: 'التشغيل',
      traditional: 'حجز موعد',
      seeda: 'متابعة أمر العمل حتى التسليم'
    },
    {
      aspect: 'الضمانات',
      traditional: 'غالبًا خارج النظام',
      seeda: 'إدارة الضمانات الإلكترونية ومواعيدها'
    },
    {
      aspect: 'الفنيون',
      traditional: 'تحديد المسؤول',
      seeda: 'إسناد المهام وقياس الأداء'
    },
    {
      aspect: 'العمولات',
      traditional: 'حساب يدوي غالبًا',
      seeda: 'قواعد احتساب ومراجعة واعتماد'
    },
    {
      aspect: 'الذكاء الاصطناعي',
      traditional: 'محدود أو غير متوفر',
      seeda: 'معالجة طلبات التواصل وتحليل البيانات بحسب التكاملات'
    },
    {
      aspect: 'الفروع',
      traditional: 'إدارة منفصلة أحيانًا',
      seeda: 'رؤية مركزية ومقارنات بين الفروع'
    },
    {
      aspect: 'الإدارة',
      traditional: 'تقارير محدودة',
      seeda: 'مؤشرات تشغيلية وتجارية ومالية مترابطة'
    }
  ];

  // Section 5: Target Customers
  const targetAudiences = [
    {
      title: 'مراكز حماية السيارات',
      desc: 'خدمات PPF والنانو سيراميك والعزل الحراري.',
      icon: 'security'
    },
    {
      title: 'مراكز العناية والتفصيل',
      desc: 'التنظيف والتلميع والعناية الداخلية والخارجية.',
      icon: 'auto_fix_high'
    },
    {
      title: 'مراكز التظليل والتغليف',
      desc: 'تظليل النوافذ وتغيير ألوان المركبات.',
      icon: 'directions_car'
    },
    {
      title: 'الشركات متعددة الفروع',
      desc: 'إدارة العمليات والموظفين والأداء من لوحة مركزية.',
      icon: 'domain'
    },
    {
      title: 'سلاسل مراكز السيارات',
      desc: 'توحيد إجراءات التشغيل والخدمات والتقارير عبر المواقع المختلفة.',
      icon: 'account_tree'
    }
  ];

  // Render Visual Photo Preview from Project Assets (Clean images without text)
  const renderPreview = (module) => {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 group h-56 sm:h-64 md:h-full min-h-[240px] w-full bg-slate-100 flex items-center justify-center">
        <img
          src={module.image}
          alt={module.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-body selection:bg-[#5C24EB] selection:text-white flex flex-col" dir="rtl">
      
      {/* ── Main Container: Sidebar + Content ───────────────────── */}
      <div className="flex flex-1 w-full">

        {/* ── Main Scrollable Content Area ──────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col">
          
          {/* Top Bar with SEEDA Logo on the right */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between">
            
            {/* Mobile menu button & quick back */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
                title="رجوع"
              >
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <div className="text-xs font-bold text-slate-500 hidden sm:block">
                المنصة المتخصصة لمراكز العناية بالسيارات
              </div>
            </div>

            {/* SEEDA Logo (Top Right in RTL) */}
            <div className="flex items-center gap-3">
              <Link to="/about-seeda" className="flex items-center">
                <img
                  src="/assets/photo/seeda-dark-text.png"
                  alt="SEEDA | سيدا"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </Link>
            </div>

          </header>

          {/* Page Body Content */}
          <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-12">
            
            {/* ── Hero Banner Section (Exactly as in reference image) ── */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-white via-purple-50/50 to-purple-100/40 border border-purple-200/60 shadow-sm p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Side: Car Image with subtle arrow chevron */}
                <div className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center items-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-md max-w-md w-full group">
                    <img
                      src="/assets/photo/seeda_hero_car.jpg"
                      alt="سيارة فاخرة - نظام سيدا"
                      className="w-full h-auto object-cover rounded-2xl"
                    />
                    {/* Purple accent overlay arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600/60 pointer-events-none hidden sm:block">
                      <span className="material-symbols-outlined text-5xl">chevron_left</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Exact Intro Text */}
                <div className="lg:col-span-7 space-y-4 text-right order-1 lg:order-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ما هو نظام <span className="text-[#6827DE]">سيدا</span>؟
                  </h1>
                  
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-[#6827DE] text-xs font-bold">
                    نظام إدارة وتشغيل مراكز العناية بالسيارات
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    سيدا هو نظام رقمي متخصص في إدارة عمليات مراكز العناية بالسيارات، صُمم لمساعدة الشركات على تنظيم أعمالها، وأتمتة إجراءاتها اليومية، وتحسين تجربة العملاء، ورفع كفاءة الموظفين والفنيين، ومراقبة أداء الفروع من خلال منصة موحدة.
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    يجمع النظام بين إدارة العملاء، والخدمات والباقات، والحجوزات والمواعيد، وأوامر العمل، والفنيين والعمولات، والضمانات الإلكترونية، وطلبات التواصل المدعومة بالذكاء الاصطناعي، والتقارير ولوحات التحكم الإدارية؛ مما يمنح الإدارة رؤية أوضح لأداء المنشأة ويساعدها على اتخاذ قرارات مبنية على البيانات.
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    ويستهدف سيدا مراكز العناية بالسيارات التي تقدم خدمات مثل حماية الطلاء (PPF)، والعزل الحراري، والنانو سيراميك، وتظليل النوافذ، والعناية الداخلية والخارجية، وغيرها من خدمات السيارات.
                  </p>
                </div>

              </div>
            </section>

            {/* ── Section 1: أولًا: الوحدات الرئيسية لنظام سيدا (12 Modules) ── */}
            <section className="space-y-8">
              
              <div className="border-b border-slate-200 pb-4 text-right">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  أولًا: الوحدات الرئيسية لنظام سيدا
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  منظومة متكاملة من 12 وحدة تغطي كل مرحلة تشغيلية داخل مراكز العناية بالسيارات
                </p>
              </div>

              {/* Modules Vertical Timeline List */}
              <div className="relative space-y-8">
                
                {/* Vertical timeline connecting line on the right */}
                <div className="absolute top-8 bottom-8 right-5 w-0.5 bg-slate-200 hidden md:block" />

                {modules.map((module) => (
                  <div
                    key={module.num}
                    className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow"
                  >
                    
                    {/* Left Column: UI Mockup or Real Photo */}
                    <div className="md:col-span-5 order-2 md:order-1">
                      {renderPreview(module)}
                    </div>

                    {/* Middle Column: Exact Module Text and Details */}
                    <div className="md:col-span-6 order-3 md:order-2 space-y-3 text-right">
                      
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-purple-50 text-[#6827DE] border border-purple-200/60 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">{module.icon}</span>
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {module.num}. {module.title}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {module.desc}
                      </p>

                      {/* Bullet points verbatim */}
                      <ul className="space-y-1.5 pt-1 pr-2">
                        {module.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6827DE] mt-1.5 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Extra Paragraph if present */}
                      {module.extraParagraph && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {module.extraParagraph}
                        </p>
                      )}

                      {/* Important note / callout if present */}
                      {module.note && (
                        <div className="mt-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 leading-relaxed flex items-start gap-2">
                          <span className="material-symbols-outlined text-purple-600 text-base shrink-0 mt-0.5">
                            info
                          </span>
                          <span>{module.note}</span>
                        </div>
                      )}

                    </div>

                    {/* Right Column: Timeline Number Badge (01 to 12) */}
                    <div className="md:col-span-1 order-1 md:order-3 flex md:justify-center items-center">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-purple-400 text-purple-700 font-mono font-black text-sm flex items-center justify-center shadow-xs z-10">
                        {module.num}
                      </div>
                    </div>

                  </div>
                ))}

              </div>

            </section>

            {/* ── Section 2: ثانيًا: كيف تعمل جميع الوحدات معًا؟ ───────── */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-right">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  ثانيًا: كيف تعمل جميع الوحدات معًا؟
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                  القيمة الحقيقية لسيدا ليست في وجود هذه الأقسام منفصلة، بل في ربطها ضمن دورة عمل واحدة.
                </p>
              </div>

              {/* The 8 Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {workflowSteps.map((step) => (
                  <div
                    key={step.num}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black font-mono text-[#6827DE]">
                          {step.num}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exact closing paragraph */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/60 text-xs sm:text-sm text-purple-950 leading-relaxed flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-700 text-xl shrink-0">
                  task_alt
                </span>
                <span>
                  بهذه الطريقة، لا يحتاج الموظف إلى إعادة إدخال بيانات العميل والمركبة في كل مرحلة، وتستطيع الإدارة تتبع العملية من بدايتها إلى نهايتها.
                </span>
              </div>

            </section>

            {/* ── Section 3: ثالثًا: مزايا إضافية ترفع قيمة سيدا ────────── */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-right">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  ثالثًا: مزايا إضافية ترفع قيمة سيدا
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {extraFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all space-y-2.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6827DE] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">{feat.icon}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

            </section>

            {/* ── Section 4: رابعًا: ما الذي يميز سيدا عن برامج إدارة المواعيد التقليدية؟ ── */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-right">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  رابعًا: ما الذي يميز سيدا عن برامج إدارة المواعيد التقليدية؟
                </h2>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 sm:p-4 w-1/4">الجانب</th>
                      <th className="p-3.5 sm:p-4 w-1/3 text-slate-500">برنامج مواعيد تقليدي</th>
                      <th className="p-3.5 sm:p-4 w-5/12 text-[#6827DE] bg-purple-50/50">سيدا كنظام متكامل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {comparisons.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 sm:p-4 font-bold text-slate-900">{item.aspect}</td>
                        <td className="p-3.5 sm:p-4 text-slate-500">{item.traditional}</td>
                        <td className="p-3.5 sm:p-4 text-slate-800 font-medium bg-purple-50/20">{item.seeda}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Exact concluding paragraph */}
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                هذه مقارنة وظيفية بين نوعين من الأنظمة وليست ادعاءً بأن جميع برامج المواعيد تفتقر إلى تلك المزايا. توجد بالفعل منصات متخصصة تجمع إدارة أوامر العمل والضمانات والعمولات والمخزون والتحليلات؛ لذلك يجب أن يكون تميز سيدا قائمًا على جودة التنفيذ وتجربة الاستخدام وملاءمة السوق المستهدف.
              </p>

            </section>

            {/* ── Section 5: خامسًا: لمن صُمم نظام سيدا؟ ─────────────── */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-right">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  خامسًا: لمن صُمم نظام سيدا؟
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {targetAudiences.map((aud, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6827DE] flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">{aud.icon}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {aud.desc}
                    </p>
                  </div>
                ))}
              </div>

            </section>

            {/* ── Section 6: سادسًا: تعريف مختصر للاستخدام في الموقع الإلكتروني أو الملف التعريفي ── */}
            <section className="bg-gradient-to-br from-white to-purple-50/40 border border-purple-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4 text-right">
              
              <div className="border-b border-purple-100 pb-3">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  سادسًا: تعريف مختصر للاستخدام في الموقع الإلكتروني أو الملف التعريفي
                </h2>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-base sm:text-lg font-black text-[#6827DE]">
                  SEEDA | سيدا
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  نظام متكامل لإدارة وتشغيل مراكز العناية بالسيارات
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  سيدا هو نظام رقمي متخصص في إدارة وتشغيل مراكز العناية بالسيارات، يجمع بين إدارة العملاء والمركبات، وتنظيم العمليات وأوامر العمل، وإدارة الخدمات والباقات والمواعيد، وإصدار الضمانات الإلكترونية، ومتابعة الفنيين والعمولات، وإدارة طلبات التواصل المدعومة بالذكاء الاصطناعي، وتحليل أداء الفروع في منصة واحدة.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  يهدف سيدا إلى أتمتة الإجراءات اليومية، وتحسين تجربة العملاء، ورفع كفاءة التشغيل، وتعزيز الرقابة الإدارية، وتوفير بيانات دقيقة تساعد أصحاب الأعمال على اتخاذ قرارات أفضل.
                </p>
                <div className="pt-2 font-black text-xs sm:text-sm text-purple-900">
                  سيدا — كل عمليات مركز العناية بالسيارات، في نظام واحد.
                </div>
              </div>

            </section>

            {/* ── Bottom Feature Banner (Exactly as in the reference screenshot) ── */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Logo in Screenshot */}
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <img
                  src="/assets/photo/seeda-dark-text.png"
                  alt="SEEDA | سيدا"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>

              {/* Vertical divider */}
              <div className="h-8 w-px bg-slate-200 hidden sm:block order-2" />

              {/* Right Slogan in Screenshot */}
              <div className="text-center sm:text-right order-1 sm:order-3">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  كل عمليات مركز العناية بالسيارات .. في نظام واحد
                </h4>
                <p className="text-xs text-purple-600 font-bold mt-0.5">
                  مركزك أكثر كفاءة .. وعملاؤك أكثر رضا
                </p>
              </div>

            </section>

          </div>

          {/* Clean minimal footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
            SEEDA © {new Date().getFullYear()} جميع الحقوق محفوظة
          </footer>

        </main>

      </div>

    </div>
  );
};

export default AboutSeeda;
