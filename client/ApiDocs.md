# Reflecto API — توثيق شامل للـ Routes

هذا الملف يحتوي على التوثيق الكامل لجميع مسارات (Routes) الباك إيند، ليكون مرجعاً لمطور الـ Frontend.

**معلومات أساسية قبل البدء:**
*   **Base URL:** `https://reflecto-back.vercel.app/api/v1`
*   **Content-Type:** يجب أن يكون دائماً `application/json`
*   **Authorization:** لجميع الروابط المحمية يجب إرسال الهيدر التالي: `Authorization: Bearer <access_token>`

---

## 📌 الفهرس
1. [المصادقة وتسجيل الدخول (Auth)](#1-auth)
2. [بيانات العميل (Client Dashboard)](#2-client)
3. [بوابات الدفع (Checkout)](#3-checkout)
4. [الروابط العامة (Public)](#4-public)
5. [لوحة تحكم الإدارة (Admin Dashboard)](#5-admin)

---

## 🔒 1. المصادقة (Auth) <a id="1-auth"></a>

### `POST https://reflecto-back.vercel.app/api/v1/auth/otp/send`
*   **الاستخدام في الفرونت إيند:** عند صفحة تسجيل الدخول، لإرسال كود التحقق.
*   **Request Body:**
    ```json
    {
      "phone": "+966501234567"
    }
    ```
*   **Response `200`:**
    ```json
    {
      "success": true,
      "message": "OTP sent successfully",
      "expires_in": 300,
      "dev_otp": "482910" // ملاحظة: الكود يظهر لك هنا للـ Testing
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/auth/otp/verify`
*   **الاستخدام في الفرونت إيند:** في شاشة إدخال كود التحقق (OTP).
*   **Request Body:**
    ```json
    {
      "phone": "+966501234567",
      "code": "482910"
    }
    ```
*   **Response `200`:**
    ```json
    {
      "success": true,
      "access_token": "eyJhbGciOi...",     // يُحفظ في الـ LocalStorage ويفضل استخدامه لكل الـ API Calls (ينتهي بعد 15 دقيقة)
      "refresh_token": "eyJhbGciOi...",    // يُستخدم لتجديد الـ Access Token عند انتهائه (ينتهي بعد 7 أيام)
      "user": {
        "id": "uuid",
        "full_name": "Omar Al-Rashid",
        "role": "client"
      }
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/auth/refresh`
*   **الاستخدام في الفرونت إيند:** عند تلقي رسالة `401 Unauthorized` من أي طلب، يتم استدعاء هذا الرابط باستخدام الـ `refresh_token` المخزن للحصول على `access_token` جديد وتكملة الطلب بهدوء (صمت) دون تسجيل خروج العميل وتطفيشه.
*   **Request Body:**
    ```json
    {
      "refresh_token": "eyJhbGciOi..."
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/auth/logout`
*   **الاستخدام في الفرونت إيند:** عند ضغط المستخدم "تسجيل الخروج"، يجب طلب هذا الرابط لمسح التوكنز ثم تحويله لصفحة تسجيل الدخول. (يتطلب Authorization Header).

---

## 👤 2. منطقة العميل (Client) <a id="2-client"></a>
*(هذه المسارات تتطلب تسجيل الدخول كـ "client")*

### `GET https://reflecto-back.vercel.app/api/v1/me`
*   **الاستخدام في الفرونت إيند:** في صفحة الـ **Client Dashboard** (الداشبورد الخاصة بالعميل).
*   **ملاحظة الفرونت:** هذا الرابط يغنيك عن استدعاء 5 روابط مختلفة، لأنه يجمع كل بيانات سيارة العميل، موعده الحالي، الضمان، نقاط الولاء، وإحصائياته في **طلب واحد**.
*   **Response `200`:**
    ```json
    {
      "id": "user-uuid",
      "full_name": "Omar",
      "phone": "+966501234567",
      "current_appointment": { 
        "status": "in_progress", 
        "progress": 45, 
        "time_remaining": { "days": 1, "hours": 21 }
        // يُفضل عمل شريط تحميل (Progress Bar) بناءً على حقل الـ progress
      },
      "loyalty": {
        "total_points": 2228,
        "can_redeem": true,
        "redemption_options": [
          { "points": 1000, "discount": 50, "label": "SAR 50 off" }
        ]
      },
      "warranty": {
        "is_active": 1,
        "coverage_years": 10
      },
      "stats": {
        "total_spent": 12500,
        "currency": "SAR"
      }
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/me/loyalty/redeem`
*   **الاستخدام في الفرونت إيند:** عند قيام المستخدم باستبدال نقاط الولاء (الموجودة في الـ Dashboard).
*   **Request Body:** (يمكن إرسال 1000 أو 2500 أو 5000 فقط)
    ```json
    {
      "points": 1000
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/me/loyalty/transfer`
*   **الاستخدام في الفرونت إيند:** لخاصية تحويل أو إهداء النقاط لصديق.
*   **Request Body:**
    ```json
    {
      "to_phone": "+966509876543",
      "points": 500
    }
    ```

---


## 💳 3. الدفع (Checkout) <a id="3-checkout"></a>

### `POST https://reflecto-back.vercel.app/api/v1/checkout/tabby`
*   **الاستخدام:** عند ضغط العميل على زر "ادفع بـ تابي".
*   **ملاحظة:** لا يخصم المبلغ فوراً، بل ينشئ جلسة دفع ويُرجع رابط checkout.
*   **Authentication:** ✅ Required (`Authorization: Bearer {token}`)

**Request Body:**
```json
{
  "amount": 1800,
  "currency": "SAR",
  "customer": {
    "name": "عمر الراشد",
    "phone": "+966501234567",
    "email": "omar@example.com",
    "city": "Riyadh",
    "address": "شارع الملك فهد",
    "zip": "11564"
  },
  "items": [
    {
      "title": "Diamond Package - PPF",
      "quantity": 1,
      "unit_price": 1800,
      "category": "Service",
      "reference_id": "PKG-DIAMOND-001"
    }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "sessionId": "pay_abc123xyz",
    "checkoutUrl": "https://checkout.tabby.ai/..."
  }
}
```

**استخدام في Frontend:**
```javascript
const response = await fetch('/api/checkout/tabby', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount, currency, customer, items })
});

const { data } = await response.json();
window.location.href = data.checkoutUrl; // 🚀 Redirect للدفع
```

---

### `POST https://reflecto-back.vercel.app/api/v1/checkout/tamara`
*   **الاستخدام:** عند ضغط العميل على زر "ادفع بـ تمارا".
*   **Authentication:** ✅ Required

**Request Body:**
```json
{
  "total_amount": 1800,
  "currency": "SAR",
  "customer": {
    "email": "omar@example.com",
    "first_name": "عمر",
    "last_name": "الراشد",
    "phone_number": "+966501234567",
    "city": "Riyadh",
    "address": "شارع الملك فهد"
  },
  "items": [
    {
      "name": "Diamond Package - PPF",
      "quantity": 1,
      "unit_price": 1800,
      "reference_id": "PKG-DIAMOND-001",
      "sku": "DIAMOND-SKU"
    }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "checkoutId": "tmr_abc123xyz",
    "checkoutUrl": "https://checkout.tamara.co/..."
  }
}
```

---

### `GET https://reflecto-back.vercel.app/api/v1/checkout`
*   **الاستخدام:** عرض كل عمليات الدفع (Admin فقط).
*   **Authentication:** ✅ Required
*   **Authorization:** 🔒 Admin only

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 1800,
      "currency": "SAR",
      "payment_method": "tabby",
      "session_id": "pay_abc123",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "client_name": "عمر الراشد",
      "client_phone": "+966501234567"
    }
  ]
}
```

---

### Payment Status Flow


## 🌍 4. الروابط العامة (Public) <a id="4-public"></a>
*(مفتوحة للزوار بدون تسجيل دخول)*

### `GET https://reflecto-back.vercel.app/api/v1/services`
*   **الاستخدام:** عرض الخدمات وتفاصيلها في الصفحة الرئيسية.
*   **Response `200`:** يرجع مصفوفة بالخدمات (الاسم، الوصف بالإنجليزي والعربي).

### `GET https://reflecto-back.vercel.app/api/v1/pricing`
*   **الاستخدام:** في صفحة **PricingView**. لعرض الباقات بناءً على الداتا التي ترجع وليس Hardcoded في الريأكت لتسهيل تحديثها من الإدارة مستقبلاً.
*   **Response `200`:**
    ```json
    {
      "data": [
        {
          "slug": "diamond",
          "name_en": "Diamond",
          "price": 1800,
          "warranty_years": 10,
          "features_en": ["9H Surface Hardness", "10-Year Warranty"]
        }
      ]
    }
    ```

### `POST https://reflecto-back.vercel.app/api/v1/contact`
*   **الاستخدام:** إرسال رسائل أو طلبات حجز موعد مبدئي عبر نموذج صفحة `Contact.jsx`.
*   **Request Body:**
    ```json
    {
      "full_name": "Ali Hassan",
      "phone": "+96650...",
      "car_brand": "Porsche",
      "car_model": "911",
      "service_type": "PPF",
      "preferred_date": "2026-05-01"
    }
    ```

---

## ⚙️ 5. لوحة الإدارة (Admin) <a id="5-admin"></a>
*(هذه المسارات تتطلب تسجيل الدخول وأن يكون الـ role = "admin")*

### `GET https://reflecto-back.vercel.app/api/v1/admin/overview`
*   **الاستخدام:** صفحة **Admin Overview** (Dashbord الإدارة الرئيسية).
*   **Response `200`:**
    ```json
    {
      "stats": {
        "total_revenue": 124500,
        "active_jobs": 5
      },
      "shop_snapshot": {
        "contacts_today": 3,
        "bay_capacity": { "occupied": 5, "total": 7 }
      },
      "recent_appointments": [ ... ]
    }
    ```

### `GET https://reflecto-back.vercel.app/api/v1/admin/scheduling?date=YYYY-MM-DD`
*   **الاستخدام:** جدول المواعيد في الإدارة والمحطات الزمنية لكل تقني.

### المواعيد (`/appointments`)
*   **`GET https://reflecto-back.vercel.app/api/v1/appointments`**: جلب المواعيد. يمكنك تصفيتها بـ `?status=in_progress`.
*   **`POST https://reflecto-back.vercel.app/api/v1/appointments`**: لجدولة موعد رسمي من خلال الإدارة.
*   **`PUT https://reflecto-back.vercel.app/api/v1/appointments/:id`**: لتحديث حالة الموعد أو رقيه `progress`.
    *   **ملاحظة هامة:** عندما يقوم الأدمن بتحديث الموعد إلى `status = "completed"`, فإن الباك إيند **تلقائياً** يحسب نقاط الولاء ويضيفها لحساب العميل.

### العملاء (`/clients`)
*   **`GET https://reflecto-back.vercel.app/api/v1/clients`**: قائمة العملاء للأدمن (تدعم صفحات `?page=1`).
*   **`GET https://reflecto-back.vercel.app/api/v1/clients/search?q=Omar`**: بحث سريع عن عميل برقم الهاتف أو الاسم، مفيد أثناء إنشاء موعد جديد لتحديد العميل.
*   **`PUT https://reflecto-back.vercel.app/api/v1/clients/:id`**: تحديث بيانات عميل بعينه.

### المدفوعات (`/checkout`)
*   **`GET /checkout`**: صفحة الفواتير والإجراءات المالية، ترجع كل المعاملات التي تمت بـ Tabby/Tamara مع تفاصيل العميل وحالة الدفع.

### الكوبونات (`/coupons`)
*   **`GET https://reflecto-back.vercel.app/api/v1/coupons`**: عرض الكوبونات المتوفرة وحالتها.
*   **`POST https://reflecto-back.vercel.app/api/v1/coupons`**: إنشاء كوبون.
    *   **Body:** `{"code": "SUMMER", "discount_type": "percentage", "discount_value": 20, "max_uses": 100}`
*   **`POST https://reflecto-back.vercel.app/api/v1/coupons/apply`**: فحص صحة الكوبون قبل الحجز (استخدام في صندوق إدخال الكوبون).
    *   **Body:** `{"code": "SUMMER", "original_price": 1800}`
    *   **Response:** يرجع السعر بعد الخصم (`final_price`).

---

### 🚨 تعامل الفرونت إيند مع الأخطاء (Error Handling)
جميع الأخطاء في كامل النظام مُنظمة ترجع بهذا الشكل:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP", // رمز ثابت، مفيد إذا أردت عمل Action محدد في الكود
    "message": "Invalid OTP code" // رسالة واضحة يمكن عرضها للمستخدم
  }
}
```
**نصيحة للمطور:** يجب فحص حقل `success`، إذا كان `false`، قم بإظهار `error.message` كإشعار منبثق (Toast) للعميل في واجهة الاستخدام لمساعدتك.
