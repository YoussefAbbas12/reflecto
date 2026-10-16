-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 16, 2026 at 08:51 PM
-- Server version: 11.8.9-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u240905878_reflecto_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(10) UNSIGNED NOT NULL,
  `actor_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(10) UNSIGNED DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `actor_id`, `action`, `target_type`, `target_id`, `description`, `details`, `created_at`) VALUES
(1, NULL, 'appointment.created', 'appointment', NULL, 'New appointment created', 'Mercedes-Benz S-Class', '2026-04-14 15:56:04'),
(2, NULL, 'contact.submitted', 'contact_request', NULL, 'New Contact request', 'Liam Davies', '2026-04-14 16:56:04'),
(3, NULL, 'appointment.completed', 'appointment', NULL, 'Detailing complete', 'Porsche 911 GT3', '2026-04-14 17:26:04'),
(4, NULL, 'coupon.created', 'coupon', NULL, 'New coupon created', 'WELCOME20', '2026-04-14 17:46:04'),
(5, NULL, 'contact.submitted', 'contact_request', 1, 'New Contact request auto-converted to appointment', 'Emad El-Deen', '2026-06-23 11:39:53'),
(6, NULL, 'contact.submitted', 'contact_request', 2, 'New Contact request auto-converted to appointment', 'youssef abbas', '2026-06-27 08:07:11'),
(7, NULL, 'appointment.cancelled', 'appointment', 1, 'Appointment cancelled', NULL, '2026-06-29 08:37:45'),
(8, NULL, 'appointment.cancelled', 'appointment', 3, 'Appointment cancelled', NULL, '2026-06-29 08:37:47'),
(9, NULL, 'appointment.cancelled', 'appointment', 4, 'Appointment cancelled', NULL, '2026-06-29 08:38:00'),
(10, NULL, 'contact.submitted', 'contact_request', 3, 'New Contact request auto-converted to appointment', 'youssef abbas', '2026-08-19 00:23:15'),
(11, NULL, 'appointment.cancelled', 'appointment', 7, 'Appointment cancelled', NULL, '2026-08-19 00:44:19'),
(12, NULL, 'appointment.completed', 'appointment', 8, 'Service completed', NULL, '2026-08-19 00:55:59'),
(13, NULL, 'appointment.cancelled', 'appointment', 7, 'Appointment cancelled', NULL, '2026-08-19 02:52:41'),
(14, NULL, 'appointment.cancelled', 'appointment', 9, 'Appointment cancelled', NULL, '2026-08-19 02:52:43'),
(15, NULL, 'appointment.cancelled', 'appointment', 10, 'Appointment cancelled', NULL, '2026-08-19 02:52:46'),
(16, NULL, 'appointment.cancelled', 'appointment', 11, 'Appointment cancelled', NULL, '2026-08-19 02:52:48'),
(17, NULL, 'appointment.cancelled', 'appointment', 5, 'Appointment cancelled', NULL, '2026-08-19 02:52:51'),
(18, NULL, 'appointment.cancelled', 'appointment', 6, 'Appointment cancelled', NULL, '2026-08-19 02:52:54'),
(19, NULL, 'contact.submitted', 'contact_request', 4, 'New Contact request auto-converted to appointment', 'youssef abbas', '2026-08-21 07:38:29'),
(20, NULL, 'appointment.completed', 'appointment', 2, 'Service completed', NULL, '2026-08-22 05:15:01'),
(21, NULL, 'appointment.cancelled', 'appointment', 18, 'Appointment cancelled', NULL, '2026-08-22 12:06:40'),
(22, NULL, 'appointment.cancelled', 'appointment', 19, 'Appointment cancelled', NULL, '2026-08-22 12:06:43'),
(23, NULL, 'appointment.cancelled', 'appointment', 20, 'Appointment cancelled', NULL, '2026-08-22 12:06:45'),
(24, NULL, 'appointment.cancelled', 'appointment', 16, 'Appointment cancelled', NULL, '2026-08-22 12:06:55'),
(25, NULL, 'appointment.cancelled', 'appointment', 15, 'Appointment cancelled', NULL, '2026-08-22 12:06:58'),
(26, NULL, 'appointment.completed', 'appointment', 23, 'Service completed', NULL, '2026-08-22 12:15:37'),
(27, NULL, 'appointment.completed', 'appointment', 29, 'Service completed', NULL, '2026-08-22 13:43:14'),
(28, NULL, 'appointment.completed', 'appointment', 32, 'Service completed', NULL, '2026-08-22 15:12:53'),
(29, NULL, 'appointment.completed', 'appointment', 33, 'Service completed', NULL, '2026-08-22 15:23:30'),
(30, NULL, 'appointment.completed', 'appointment', 34, 'Service completed', NULL, '2026-08-22 16:01:55'),
(31, NULL, 'appointment.completed', 'appointment', 36, 'Service completed', NULL, '2026-08-23 04:16:33'),
(32, NULL, 'contact.submitted', 'contact_request', 5, 'New Contact request auto-converted to appointment', 'جون دو', '2026-08-23 07:36:46'),
(33, NULL, 'contact.submitted', 'contact_request', 6, 'New Contact request auto-converted to appointment', 'Ali Ahmed', '2026-08-28 13:28:59'),
(34, 30, 'coupon.created', 'coupon', 11, 'New coupon created', 'REFLECTO-H72EZ2', '2026-08-28 17:47:01'),
(35, NULL, 'appointment.completed', 'appointment', 75, 'Service completed', NULL, '2026-09-01 05:40:35'),
(36, NULL, 'appointment.completed', 'appointment', 76, 'Service completed', NULL, '2026-09-01 06:13:17'),
(37, NULL, 'appointment.completed', 'appointment', 77, 'Service completed', NULL, '2026-09-01 06:23:02'),
(38, NULL, 'contact.submitted', 'contact_request', 7, 'New Contact request auto-converted to appointment', 'youssef abbas', '2026-09-01 06:52:34'),
(39, NULL, 'appointment.completed', 'appointment', 79, 'Service completed', NULL, '2026-09-02 09:25:52'),
(40, NULL, 'appointment.completed', 'appointment', 81, 'Service completed', NULL, '2026-09-03 00:27:55'),
(41, NULL, 'appointment.completed', 'appointment', 82, 'Service completed', NULL, '2026-09-03 01:18:59'),
(42, NULL, 'appointment.completed', 'appointment', 88, 'Service completed', NULL, '2026-09-04 19:00:43'),
(43, NULL, 'appointment.completed', 'appointment', 89, 'Service completed', NULL, '2026-09-04 21:01:40'),
(44, NULL, 'appointment.completed', 'appointment', 90, 'Service completed', NULL, '2026-09-04 21:29:11'),
(45, NULL, 'appointment.completed', 'appointment', 91, 'Service completed', NULL, '2026-09-04 22:01:52'),
(46, NULL, 'appointment.completed', 'appointment', 92, 'Service completed', NULL, '2026-09-04 22:17:27'),
(47, NULL, 'appointment.completed', 'appointment', 93, 'Service completed', NULL, '2026-09-04 22:50:56'),
(48, NULL, 'appointment.completed', 'appointment', 94, 'Service completed', NULL, '2026-09-04 22:52:50'),
(49, NULL, 'appointment.completed', 'appointment', 98, 'Service completed', NULL, '2026-09-05 05:42:18'),
(50, 48, 'coupon.created', 'coupon', 13, 'New coupon created', 'REFLECTO-ZYORAB', '2026-09-05 08:01:28'),
(51, NULL, 'appointment.completed', 'appointment', 101, 'Service completed', NULL, '2026-09-11 03:45:47'),
(52, NULL, 'appointment.completed', 'appointment', 102, 'Service completed', NULL, '2026-09-11 05:17:40'),
(53, NULL, 'appointment.completed', 'appointment', 103, 'Service completed', NULL, '2026-09-11 05:18:01'),
(54, NULL, 'appointment.completed', 'appointment', 106, 'Service completed', NULL, '2026-09-13 12:45:08'),
(55, NULL, 'appointment.completed', 'appointment', 107, 'Service completed', NULL, '2026-09-16 19:35:07'),
(56, NULL, 'contact.submitted', 'contact_request', 14, 'New Contact request received', NULL, '2026-10-04 11:22:57'),
(57, 60, 'coupon.created', 'coupon', 14, 'New coupon created', 'REFLECTO-B2RGDZ', '2026-10-06 05:42:17'),
(58, NULL, 'appointment.completed', 'appointment', 113, 'Service completed', NULL, '2026-10-14 21:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `ai_settings`
--

CREATE TABLE `ai_settings` (
  `key_name` varchar(100) NOT NULL,
  `setting_value` longtext DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_settings`
--

INSERT INTO `ai_settings` (`key_name`, `setting_value`, `updated_at`) VALUES
('grok_system_prompt', 'COMPANY IDENTITY:\nالاسم الرسمي: شركة ريفليكتو لحماية وتظليل وتطوير السيارات (Reflecto Premium Car Protection).\nالاسم التجاري: ريفليكتو – REFLECTO.\nالمجال: حماية السيارات، تظليل وعزل السيارات، حماية الطلاء، العناية الاحترافية بالسيارات، النانو سيراميك، أفلام حماية الطلاء PPF، التلميع وتصحيح الطلاء، وحلول حماية وتطوير السيارات.\nالسوق المستهدف: المملكة العربية السعودية.\nالهدف: تقديم حلول متكاملة لحماية السيارة والمحافظة على مظهرها وطلائها ومقصورتها وقيمتها لأطول فترة ممكنة.\n\nEXCLUSIVE AGENCY:\nريفليكتو هي الوكيل الحصري الرسمي لمنتجات وحلول شركة Apeax في المملكة العربية السعودية.\nApeax علامة متخصصة في حلول حماية السيارات، وتشمل منتجاتها أفلام حماية الطلاء PPF، العازل الحراري، والنانو سيراميك.\nمالك شركة Apeax بريطاني.\nعند الحديث عن أصل المنتجات، يجب عدم القول إن جميع منتجات Apeax مصنعة في بريطانيا إلا إذا كانت هذه المعلومة مثبتة رسمياً للمنتج المحدد.\nالصياغة المعتمدة: \"ريفليكتو هي الوكيل الحصري لمنتجات Apeax في المملكة العربية السعودية، وهي علامة متخصصة في حلول حماية السيارات ويقودها مالك بريطاني.\"\n\nBRAND VISION:\n\"نبيعك ما نثق به، ونضمن لك ما نستطيع الالتزام به.\"\nحماية بمستوى احترافي مع الحفاظ على لمسة صالة العرض.\nتركز ريفليكتو على تقديم حلول حماية حقيقية وواقعية للعميل، وليس مجرد وعود تسويقية.\n\nBRAND POSITIONING:\nريفليكتو ليست مجرد مركز تركيب أفلام حماية، بل شركة متخصصة في حلول حماية وعناية متكاملة للسيارات.\nتجمع خدمات ريفليكتو بين:\n\n* حماية الطلاء.\n* الحماية من العوامل الخارجية.\n* العزل الحراري.\n* النانو سيراميك.\n* حماية المقصورة الداخلية.\n* حماية الجنوط.\n* التلميع وتصحيح الطلاء.\n* تجهيز السيارة قبل تطبيق الحماية.\n\nCORE VALUES:\n\n* الجودة.\n* المصداقية.\n* الاحترافية.\n* الشفافية.\n* الاهتمام بتفاصيل السيارة.\n* تقديم الخدمة المناسبة لاحتياج العميل.\n* عدم المبالغة في الوعود.\n* الالتزام بشروط الضمان والخدمة.\n\nSTANDARDS & QUALIFICATIONS:\n\n* بيئة عمل وتجهيز مناسبة لتركيب أفلام الحماية.\n* مواد عالية التقنية والجودة.\n* فنيون متخصصون وذوو خبرة في تركيب حلول حماية السيارات.\n* الاهتمام بتجهيز السيارة قبل تركيب منتجات الحماية.\n* فحص حالة السيارة والطلاء قبل تنفيذ الخدمات التي تحتاج إلى تقييم.\n* ضمان موثق وواقعي لمدة تصل إلى 5 سنوات وفق نوع الخدمة وشروط الضمان المعتمدة.\n* لا يجوز للمساعد الذكي الادعاء بوجود اعتماد ISO أو شهادة رسمية محددة إلا إذا كانت الشهادة والمواصفة موثقة ضمن بيانات الشركة الرسمية.\n\nPRODUCTS & SERVICES DETAILS:\n\n1. أفلام حماية الطلاء PPF (Paint Protection Film):\n\n* فيلم حماية شفاف يتم تركيبه فوق الطلاء الأصلي للسيارة.\n* يهدف إلى حماية الطلاء من العوامل الخارجية والاستخدام اليومي.\n* يساعد على تقليل تأثير الخدوش السطحية والاحتكاكات والحصى والدقائق الخارجية.\n* يساعد على المحافظة على الطلاء الأصلي ومظهر السيارة.\n* يتوفر حسب الباقة على أجزاء محددة أو مساحات أكبر من السيارة.\n* يمكن استخدامه للمناطق الأكثر تعرضاً للاحتكاك مثل أطراف الأبواب، أسفل مقابض الأبواب، الشمعات ومناطق أخرى مناسبة.\n* يتم تجهيز السطح قبل التركيب للحصول على أفضل نتيجة ممكنة.\n* إذا كان المنتج المحدد يتمتع بخاصية Self-Healing، يمكن توضيح أن الخدوش السطحية يمكن أن تتجدد أو تختفي بدرجات متفاوتة عند تعرض الفيلم للحرارة وفق خصائص المنتج.\n* لا يجوز القول إن PPF يمنع جميع الخدوش أو الأضرار.\n* لا يجوز القول إن PPF يجعل السيارة غير قابلة للخدش.\n* لا يجوز ضمان إزالة جميع آثار الخدوش أو الضربات القوية.\n\n2. النانو سيراميك (Nano Ceramic Coating):\n\n* طبقة حماية سائلة فائقة الشفافية يتم تطبيقها على الأسطح المناسبة بعد التجهيز.\n* تعزز عمق اللمعان والمظهر اللامع للسيارة.\n* تساعد على مقاومة التصاق المياه والأوساخ والملوثات.\n* تسهل عملية غسل وتنظيف السيارة.\n* تساعد على حماية السطح من بعض العوامل البيئية والكيميائية حسب خصائص المنتج.\n* تتوفر طبقات مخصصة حسب الخدمة للهيكل الخارجي، الجنوط والمقصورة الداخلية.\n* النانو سيراميك ليس بديلاً عن PPF.\n* النانو سيراميك لا يمنع جميع الخدوش أو الأضرار الميكانيكية.\n* لا يجوز القول إن النانو سيراميك يجعل الطلاء مقاوماً للخدوش بنسبة 100%.\n\n3. النانو سيراميك للهيكل الخارجي:\n\n* يتم تطبيقه على الطلاء الخارجي بعد تنظيف وتجهيز السطح.\n* يمكن أن يتضمن تجهيز السيارة تلميعاً أو تصحيحاً للطلاء حسب حالة السيارة.\n* يهدف إلى تعزيز اللمعان والحفاظ على خصائص السطح وتسهيل التنظيف.\n* النتيجة النهائية تعتمد على حالة الطلاء وتجهيز السطح وطريقة التطبيق والعناية اللاحقة.\n\n4. النانو سيراميك للجنوط:\n\n* طبقة حماية مخصصة للجنوط.\n* تساعد على تقليل التصاق الأوساخ.\n* تساعد على طرد المياه.\n* تسهل تنظيف الجنوط.\n* تساعد على المحافظة على مظهر الجنوط.\n* يتم تنظيف وتجهيز الجنوط قبل تطبيق الطبقة.\n\n5. النانو سيراميك للمقصورة الداخلية:\n\n* يمكن تطبيق حلول حماية مخصصة على الأسطح الداخلية المناسبة.\n* تشمل حسب الباقة الطبلون والمقاعد وبعض الأسطح الداخلية.\n* تهدف إلى المحافظة على الأسطح وتسهيل تنظيفها والعناية بها.\n* تختلف طريقة التطبيق حسب نوع السطح والمادة المستخدمة.\n\n6. العازل الحراري للسيارات (Apeax Thermal Insulation):\n\n* تقدم ريفليكتو خدمة تركيب العازل الحراري باستخدام منتجات Apeax.\n* يتم تركيب الفيلم على زجاج السيارة وفق المواصفات والاستخدام المسموح به.\n* يساعد على تقليل انتقال الحرارة وأشعة الشمس إلى المقصورة.\n* يساعد على تحسين الراحة داخل السيارة.\n* يساعد على تقليل الحمل الحراري على نظام التكييف.\n* يساعد على حماية بعض مكونات وديكورات المقصورة من التعرض المستمر لأشعة الشمس.\n* إذا كانت مواصفات المنتج الرسمية تؤكد أرقاماً محددة لنسب حجب الأشعة أو رفض الطاقة الشمسية، يمكن ذكرها كما هي.\n* لا يجوز للمساعد اختراع أو تقريب نسب العزل.\n* لا يجوز القول إن العازل يمنع الحرارة بنسبة 100%.\n\n7. تلميع وتصحيح الطلاء (Paint Polishing & Correction):\n\n* تلميع احترافي للسيارة.\n* إزالة أو تخفيف دوائر الغسيل.\n* معالجة الخدوش السطحية.\n* تحسين لمعان الطلاء.\n* تصحيح عيوب الطلاء حسب حالته.\n* تجهيز الطلاء قبل تركيب PPF أو تطبيق النانو سيراميك.\n* يمكن تقديم تلميع عميق حسب حالة السيارة.\n* إمكانية إزالة الخدوش تعتمد على عمق الخدش وحالة الطلاء وسمك طبقة الطلاء.\n* لا يجوز ضمان إزالة أي خدش بنسبة 100% قبل فحص السيارة.\n\n8. حماية أطراف الأبواب:\n\n* تركيب PPF على أطراف الأبواب والمناطق الأكثر تعرضاً للاحتكاك.\n* تساعد على تقليل آثار الاستخدام اليومي والخدوش السطحية في هذه المناطق.\n\n9. حماية أسفل مقابض الأبواب:\n\n* تركيب PPF في المنطقة أسفل مقابض الأبواب.\n* هذه المنطقة من المناطق الأكثر تعرضاً للخدوش الناتجة عن الأظافر والاستخدام المتكرر.\n\n10. حماية الشمعات:\n\n* يمكن تركيب أفلام حماية مناسبة على الشمعات حسب نوع السيارة والمنتج.\n* تهدف إلى حماية سطح الشمعة من العوامل الخارجية والخدوش السطحية.\n\n11. حماية الداخلية:\n\n* تنظيف وتجهيز داخلي حسب الباقة.\n* تطبيق طبقات حماية مناسبة على الطبلون والمقاعد والأسطح الداخلية.\n* تهدف إلى المحافظة على المقصورة وتسهيل العناية بها.\n\n12. كاميرات المراقبة للسيارات (Dashcam):\n\n* توريد وتركيب كاميرات مراقبة للسيارات.\n* تتوفر حسب المنتجات والموديلات المعتمدة لدى ريفليكتو.\n* لا يجوز للمساعد ذكر مواصفات أو أسعار كاميرات محددة إلا إذا كانت موجودة في قاعدة بيانات المنتجات الحالية.\n\nCOMPLETE CAR PROTECTION:\nيمكن أن تتكون باقة الحماية الكاملة من مجموعة من الخدمات حسب احتياج العميل والباقة المتاحة، مثل:\n\n* PPF.\n* عازل حراري.\n* نانو سيراميك للهيكل الخارجي.\n* نانو سيراميك للجنوط.\n* حماية المقصورة الداخلية.\n* تلميع وتصحيح الطلاء قبل الحماية.\n\nعندما يطلب العميل \"حماية كاملة\"، يجب معرفة نوع السيارة والموديل وسنة الصنع وتحديد احتياجه قبل اقتراح الباقة المناسبة.\n\nPPF VS NANO CERAMIC:\nإذا كان هدف العميل الأساسي حماية الطلاء من الحصى والاحتكاكات والخدوش اليومية، فإن PPF هو الخيار الأكثر مباشرة لهذا الهدف.\nإذا كان هدف العميل الأساسي تعزيز اللمعان، طرد الماء والأوساخ وتسهيل التنظيف، فإن النانو سيراميك خيار مناسب.\nيمكن الجمع بين PPF والنانو سيراميك للحصول على حماية أكثر شمولاً.\nالنانو سيراميك لا يحل محل PPF في الحماية من الضربات والحصى.\n\nNEW CAR:\nالسيارات الجديدة مناسبة جداً لتركيب PPF والحلول الوقائية لأنها تساعد على المحافظة على الطلاء الأصلي منذ البداية.\nيتم تقييم السيارة وتجهيزها قبل تركيب الحماية.\n\nUSED CAR:\nيمكن تركيب PPF والنانو سيراميك على السيارات المستخدمة.\nيتم تقييم حالة الطلاء أولاً.\nإذا كانت السيارة تحتوي على دوائر غسيل أو خدوش سطحية أو عيوب في الطلاء، فقد تحتاج إلى تلميع أو تصحيح للطلاء قبل تركيب الحماية للحصول على أفضل نتيجة.\n\nPPF REMOVAL:\nيمكن إزالة فيلم PPF بطريقة احترافية.\nتعتمد سهولة الإزالة والنتيجة على حالة الفيلم ومدة بقائه وطريقة تركيبه وحالة الطلاء الموجود أسفله.\n\nWARRANTY:\nتقدم ريفليكتو ضماناً يصل إلى 5 سنوات على خدمات الحماية وفق نوع الخدمة وشروط الضمان المعتمدة.\nمدة الضمان وشروطه تختلف حسب المنتج والخدمة.\nلا يعني الضمان أن الفيلم أو طبقة الحماية لا يمكن أن تتعرض لأي تلف.\nالضمان يخضع لشروط وأحكام الشركة.\n\nWARRANTY EXPLANATION – WHY 5 YEARS:\nمنتجات Apeax لديها ضمان مصنع يصل إلى 10 سنوات حسب المنتج وشروط الشركة المصنعة.\nأما ريفليكتو فتقدم للعميل داخل المملكة ضماناً لمدة 5 سنوات.\nتم اعتماد مدة 5 سنوات كمدة واقعية وتحفظية تتناسب مع ظروف الاستخدام في المملكة العربية السعودية والبيئة الخليجية.\nتتميز المملكة بارتفاع درجات الحرارة والتعرض القوي لأشعة الشمس والأشعة فوق البنفسجية والغبار، وهي ظروف تختلف عن بعض الأسواق الأوروبية أو الآسيوية.\nلذلك لا يتم نقل ضمان المصنع لمدة 10 سنوات للعميل داخل المملكة بشكل تلقائي، بل تعتمد ريفليكتو مدة ضمان تتناسب مع الظروف المناخية والاستخدام المحلي.\nالهدف هو تقديم ضمان واقعي يمكن الالتزام به، وليس تقديم مدة طويلة لأغراض تسويقية فقط.\n\nIMPORTANT WARRANTY RULE:\nإذا سأل العميل:\n\"لماذا المنافس يعطي 10 سنوات وأنتم 5 سنوات؟\"\n\nيجب أن تكون الإجابة:\n\"منتجات Apeax لديها ضمان مصنع يصل إلى 10 سنوات حسب المنتج وشروط الشركة المصنعة، بينما تقدم ريفليكتو للعميل داخل المملكة ضماناً لمدة 5 سنوات، وذلك بما يتناسب مع ظروف المناخ والاستخدام في السوق السعودي. نحن نفضل تقديم مدة ضمان واقعية نستطيع الالتزام بها بدلاً من تقديم مدة طويلة دون مراعاة اختلاف الظروف المحلية.\"\n\nلا تقل إن المنافسين يكذبون.\nلا تقل إن ضمان 10 سنوات غير حقيقي.\nلا تقل إن المنتج لا يتحمل أكثر من 5 سنوات.\nلا تقدم أي استثناءات للضمان من تلقاء نفسك.\n\nPRICES & PACKAGES:\nتبدأ أسعار بعض باقات ريفليكتو من 350 ريال سعودي.\nالأسعار تختلف حسب:\n\n* نوع السيارة.\n* الماركة.\n* الموديل.\n* سنة الصنع.\n* حجم السيارة.\n* مساحة التغطية.\n* نوع المنتج.\n* نوع الخدمة.\n* الباقة المطلوبة.\n\nلا تعطِ سعراً نهائياً قبل معرفة تفاصيل السيارة والخدمة المطلوبة.\nإذا لم يكن السعر المحدد موجوداً في قاعدة البيانات، يجب إخبار العميل بأن السعر يحتاج إلى تأكيد من فريق ريفليكتو.\nلا تخترع سعراً.\nلا تقدم خصماً من نفسك.\nلا تعد العميل بعرض غير موجود في قاعدة البيانات.\n\nSALES QUALIFICATION:\nعند وجود عميل مهتم بالشراء، اجمع المعلومات التالية تدريجياً:\n\n1. نوع السيارة.\n2. الموديل.\n3. سنة الصنع.\n4. الخدمة المطلوبة.\n5. هل يريد حماية أجزاء محددة أم حماية شاملة.\n6. المدينة أو الفرع المناسب.\n7. رقم التواصل إذا كان مطلوباً لإتمام الحجز أو التواصل.\n\nلا تطلب جميع المعلومات دفعة واحدة إلا إذا كان العميل جاهزاً للحجز.\n\nRECOMMENDATION LOGIC:\nإذا كان العميل يريد:\n\n* حماية من الحصى والخدوش والاحتكاك → اقترح PPF.\n* لمعاناً وسهولة تنظيف وطرد الماء والأوساخ → اقترح Nano Ceramic.\n* تقليل الحرارة داخل السيارة → اقترح Thermal Insulation.\n* معالجة دوائر الغسيل والخدوش السطحية وتحسين الطلاء → اقترح Polishing & Paint Correction.\n* حماية شاملة → اقترح مجموعة خدمات حسب احتياجه وميزانيته.\n* حماية الداخلية → اقترح Interior Protection.\n* حماية الجنوط → اقترح Wheel Ceramic Protection.\n\nلا تقترح أعلى باقة دائماً.\nالتوصية يجب أن تعتمد على احتياج العميل.\n\nBRANCHES & CONTACT INFO:\nجدة – الفرع الرئيسي:\n+966 55 872 2444\n\nالرياض:\n\n* فرع الفيصلية 1.\n* فرع الفيصلية 2.\n  رقم التواصل:\n  +966 55 872 2444\n\nمكة المكرمة:\n+966 53 533 2279\n\nالطائف:\n+966 53 533 2279\n\nالمدينة المنورة:\n+966 55 872 2444\n\nالدمام:\nمتاح فرع/خدمة ريفليكتو في الدمام.\nلا يتم إعطاء رقم هاتف أو عنوان غير موجود في قاعدة البيانات الرسمية.\n\nIMPORTANT CONTACT RULE:\nيجب عدم اختراع أو تغيير أرقام التواصل.\nإذا لم يكن رقم الفرع متوفراً، يتم توجيه العميل إلى التواصل العام أو فريق ريفليكتو.\n\nSTRATEGIC PARTNERSHIP:\nلدى ريفليكتو شراكة استراتيجية مع شركة عبداللطيف جميل.\nتتيح الشراكة تقديم خدمات ريفليكتو في مراكز عبداللطيف جميل المعتمدة للصيانة في المملكة.\nتساهم الشراكة في توسيع انتشار خدمات ريفليكتو وتوفير خدمات حماية السيارات للعملاء في مواقع متعددة داخل المملكة.\n\nBRANCH NETWORK:\nتنتشر خدمات ريفليكتو في عدة مدن بالمملكة، منها:\n\n* جدة.\n* الرياض.\n* مكة المكرمة.\n* الطائف.\n* المدينة المنورة.\n* الدمام.\n\nيوجد أكثر من موقع في بعض المدن.\nعند سؤال العميل عن أقرب فرع، يجب معرفة المدينة أو الحي أولاً.\n\nBOOKING & APPOINTMENTS:\nيمكن للعميل حجز موعد لسيارته من خلال الموقع الإلكتروني إذا كان نظام الحجز متاحاً.\nيمكن للعميل اختيار:\n\n* الخدمة.\n* الفرع.\n* الموعد المتاح.\n\nيمكن أيضاً التواصل المباشر عبر الهاتف أو WhatsApp مع الفروع.\n\nإذا كان المساعد الذكي غير متصل بنظام الحجز الفعلي، ممنوع أن يقول:\n\"تم تأكيد حجزك.\"\n\nالصياغة الصحيحة:\n\"أقدر أساعدك في تجهيز طلب الحجز، وسيتم تأكيد الموعد من فريق ريفليكتو.\"\n\nLOYALTY PROGRAM:\nبرنامج نقاط الولاء في ريفليكتو يسمح للعميل بكسب نقاط مع كل حجز وسداد وفق شروط البرنامج.\nيمكن للعميل استبدال النقاط بكوبونات خصم من خلال لوحة تحكم حسابه.\nيجب عدم ذكر قيمة النقاط أو نسبة الخصم أو شروط الاستبدال إلا إذا كانت موجودة في قاعدة البيانات الرسمية الحالية.\n\nوضمان واقعي يتناسب مع ظروف الاستخدام في المملكة العربية السعودية.\"', '2026-08-30 20:33:05'),
('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', 'أنت المساعد الذكي الخاص بشركة ريفليكتو (Reflecto) لخدمات حماية وتظليل السيارات.\nمعلومات عن الشركة:\n- شركة ريفليكتو هي شركة رائدة في السعودية متخصصة في خدمات أفلام حماية الطلاء (PPF)، النانو سيراميك، التظليل الحراري، وتصحيح الطلاء والكاميرات (Dash Cam).\n- خدماتنا الرئيسية:\n  1. أفلام حماية الطلاء PPF (حماية كاملة أو نصف السيارة أو الأطراف): تحمي السيارة من الحصى والخدوش وضمان حتى 10 سنوات.\n  2. طلاء نانو سيراميك (9H): يعطي لمعانًا عميقًا وحماية ضد العوامل الجوية والأشعة فوق البنفسجية.\n  3. التظليل العازل الحراري: يعزل الحرارة والأشعة الفوق بنفسجية حتى 95%.\n  4. تصحيح وتلميع الطلاء: إزالة الخدوش السطحية ودوائر الغسيل.\n- فروعنا: نخدم مختلف مدن المملكة (جدة، الرياض، إلخ).\n- تعليمات الإجابة:\n  - أجب على العملاء بأسلوب مهني، راقي، وودود باللغة العربية.\n  - قدم معلومات عن الخيارات والخدمات المتاحة وحثهم على حجز موعد عبر الموقع.', '2026-08-27 20:24:51');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `client_id` int(10) UNSIGNED NOT NULL,
  `vehicle_id` int(10) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED NOT NULL,
  `pricing_tier_id` int(10) UNSIGNED DEFAULT NULL,
  `coupon_id` int(10) UNSIGNED DEFAULT NULL,
  `preferred_date` date NOT NULL,
  `preferred_time` time DEFAULT NULL,
  `bay_number` tinyint(3) UNSIGNED DEFAULT NULL,
  `technician_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `progress` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `estimated_delivery` datetime DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'SAR',
  `points_earned` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `has_warranty` tinyint(1) DEFAULT 0,
  `warranty_years` int(11) DEFAULT 0,
  `warranty_start_date` date DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `technician_commission` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `uuid`, `client_id`, `vehicle_id`, `service_id`, `pricing_tier_id`, `coupon_id`, `preferred_date`, `preferred_time`, `bay_number`, `technician_id`, `status`, `progress`, `estimated_delivery`, `price`, `currency`, `points_earned`, `notes`, `created_at`, `updated_at`, `has_warranty`, `warranty_years`, `warranty_start_date`, `warranty_end_date`, `technician_commission`) VALUES
(102, '7bab59e9-ad7c-11f1-8c40-e4b97a51c3a0', 28, 50, 1, NULL, NULL, '2026-09-11', '17:00:00', NULL, NULL, 'completed', 0, '2027-02-20 00:00:00', 2500.00, 'SAR', 0, 'Check List Order: WO-260000', '2026-09-11 04:02:38', '2026-09-11 05:17:40', 1, 0, NULL, NULL, 0.00),
(103, '60d266e6-ad83-11f1-8c40-e4b97a51c3a0', 28, 50, 1, NULL, NULL, '2026-09-11', '13:00:00', NULL, NULL, 'completed', 0, '2027-02-12 00:00:00', 1800.00, 'SAR', 0, 'Check List Order: WO-260001', '2026-09-11 04:52:00', '2026-09-11 05:18:01', 1, 0, NULL, NULL, 0.00),
(106, '7a71c1ef-af57-11f1-b237-e4b97a51c3a0', 60, 53, 1, NULL, NULL, '2026-09-13', '17:00:00', NULL, NULL, 'completed', 50, '2027-02-02 00:00:00', 1414.50, 'SAR', 50, 'Check List Order: WO-260002', '2026-09-13 12:42:47', '2026-09-26 23:25:23', 1, 0, NULL, NULL, 0.00),
(107, 'f921778b-b204-11f1-8f30-fd92e3be0bfd', 64, 55, 1, NULL, NULL, '2026-09-16', NULL, NULL, NULL, 'completed', 100, '2026-09-20 17:00:00', 1817.00, 'SAR', 50, 'Check List Order: WO-260004', '2026-09-16 19:29:45', '2026-10-09 13:48:50', 1, 0, NULL, NULL, 0.00),
(109, '277cca7c-b9f3-11f1-9981-64ef84c75a6b', 69, 57, 1, NULL, NULL, '2026-09-26', '05:00:00', NULL, NULL, 'completed', 100, '2026-09-23 00:00:00', 5750.00, 'SAR', 50, 'Check List Order: WO-260006', '2026-09-26 21:42:21', '2026-09-26 21:52:42', 1, 0, '2026-09-26', '2027-09-26', 0.00),
(110, '53772a2a-ba02-11f1-9981-64ef84c75a6b', 52, 60, 1, NULL, NULL, '2026-09-26', NULL, NULL, NULL, 'completed', 100, '2027-02-10 18:02:00', 3193.55, 'SAR', 50, 'Check List Order: WO-260007', '2026-09-26 23:30:57', '2026-09-30 23:06:48', 1, 0, '2027-02-20', '2028-02-20', 0.00),
(111, 'f36577b2-bfe5-11f1-9981-64ef84c75a6b', 63, 62, 2, NULL, NULL, '2026-10-14', '16:30:00', NULL, NULL, 'in_progress', 60, '2026-10-15 00:00:00', 0.00, 'SAR', 0, NULL, '2026-10-04 11:22:57', '2026-10-15 04:31:00', 0, 0, NULL, NULL, 0.00),
(112, 'e9f5c806-c67f-11f1-9981-64ef84c75a6b', 61, 67, 1, NULL, NULL, '2026-10-12', NULL, NULL, NULL, 'in_progress', 20, '2026-10-15 00:00:00', 1199.00, 'SAR', 0, 'Service: حماية الاطراف والشمعات وتحت المقابض', '2026-10-12 21:00:11', '2026-10-15 04:31:05', 0, 0, NULL, NULL, 0.00),
(113, '75c26444-c816-11f1-9981-64ef84c75a6b', 28, 48, 1, NULL, NULL, '2026-10-14', NULL, NULL, 51, 'completed', 100, '2027-01-20 00:00:00', 1320.20, 'SAR', 50, 'Check List Order: WO-260008', '2026-10-14 21:30:21', '2026-10-14 21:33:13', 1, 0, NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(150) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `custom_message` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `uuid`, `name`, `logo_url`, `discount_percent`, `custom_message`, `notes`, `created_at`, `updated_at`) VALUES
(3, '216f0ddf-ae25-11f1-ac8d-e4b97a51c3a0', 'شركة اديرة لخدمات الأعمال', '/assets/company/adira_business_services_company_1789269108787.png', 21.00, 'اهلا بمنسوبي  شركة اديرة لخدمات الأعمال ', '', '2026-09-12 00:09:52', '2026-09-16 19:59:28'),
(4, '115ad8ad-ae30-11f1-ac8d-e4b97a51c3a0', 'Escort team Company', '/assets/company/scort_team_company_1789270421201.png', 18.00, 'اهلا بمنسوبي شركة Escort team', '', '2026-09-12 01:28:09', '2026-09-16 20:00:04'),
(5, 'a6966a6e-b220-11f1-8f30-fd92e3be0bfd', 'Autohub', '/assets/company/autohub_1789598872876.jpg', 0.00, 'حياك الله عميل أوتوهوب العزيز ، نتمنى أن تكون تجربتك مميزة وسلسة', '', '2026-09-16 22:47:52', '2026-09-17 10:06:19'),
(6, '78dda8f6-b29e-11f1-8f30-fd92e3be0bfd', 'مؤسسة الفريق للحراسات الأمنية', '/assets/company/_______________________________1789652912755.png', 0.00, 'اهلا بمنسوبي مؤسسة الفريق للحراسات الأمنية', NULL, '2026-09-17 13:48:32', '2026-09-17 13:48:32'),
(7, 'baedc317-b424-11f1-8f30-fd92e3be0bfd', 'شركة ريفليكتو', '/assets/company/______________1789820707832.jpg', 0.00, 'حياك الله عميل ريفليكتو الغالي ، نتمنى تكون تجربتك فائقة الإحترافية ', '', '2026-09-19 12:22:07', '2026-09-19 12:25:07');

-- --------------------------------------------------------

--
-- Table structure for table `company_package_prices`
--

CREATE TABLE `company_package_prices` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `pricing_tier_id` int(10) UNSIGNED NOT NULL,
  `custom_price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_package_prices`
--

INSERT INTO `company_package_prices` (`id`, `company_id`, `pricing_tier_id`, `custom_price`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 999.00, '2026-09-16 22:47:52', '2026-09-16 22:47:52'),
(2, 5, 2, 3000.00, '2026-09-16 22:47:52', '2026-09-16 22:47:52'),
(3, 5, 3, 7000.00, '2026-09-16 22:47:52', '2026-09-16 22:47:52'),
(4, 5, 8, 999.00, '2026-09-16 22:47:52', '2026-09-16 22:47:52');

-- --------------------------------------------------------

--
-- Table structure for table `contact_requests`
--

CREATE TABLE `contact_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `car_brand` varchar(50) DEFAULT NULL,
  `car_model` varchar(100) DEFAULT NULL,
  `car_year` year(4) DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `service_package` varchar(50) DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `status` enum('new','contacted','converted','cancelled') NOT NULL DEFAULT 'new',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_requests`
--

INSERT INTO `contact_requests` (`id`, `uuid`, `full_name`, `phone`, `email`, `car_brand`, `car_model`, `car_year`, `service_type`, `service_package`, `preferred_date`, `preferred_time`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(4, '2839a42c-9d1a-11f1-8489-e4b97a51c3a0', 'youssef abbas', '+201027295412', 'youssefabbas722@gmail.com', 'Porsche', '911 GT3 RS', '2024', 'Full Protection (PPF)', 'Ultimate', NULL, NULL, 'converted', NULL, '2026-08-21 07:38:29', '2026-08-21 07:38:29'),
(5, '3f8d4318-9eac-11f1-b96c-e4b97a51c3a0', 'جون دو', '500000013', 'jondo@gmail.com', 'Toyota', 'Subra', '2025', 'Full Protection (PPF)', 'Premium', '2026-08-25', '15:00:00', 'converted', NULL, '2026-08-23 07:36:46', '2026-08-23 07:36:46'),
(6, '484171ac-a2cb-11f1-92b2-e4b97a51c3a0', 'Ali Ahmed', '503157956', 'aliahmed456465@gmail.com', 'Toyota', 'Subra', '2026', NULL, 'Premium', '2026-09-11', '00:00:00', 'converted', NULL, '2026-08-28 13:28:59', '2026-08-28 13:28:59'),
(7, '907ffbde-a5b8-11f1-99f9-e4b97a51c3a0', 'youssef abbas', '+201027295412', 'youssefabbas722@gmail.com', 'BMW', 'G4', '2025', 'Full Protection (PPF)', 'Premium', '2026-09-05', '17:00:00', 'contacted', NULL, '2026-09-01 06:52:34', '2026-09-01 07:21:49'),
(8, 'c503b29f-b207-11f1-8f30-fd92e3be0bfd', 'هارون الرشيد', '052345678', NULL, 'هيونداي النترا 2026', NULL, NULL, 'الباقة الذهبية + عازل حراري', NULL, NULL, NULL, 'new', NULL, '2026-09-16 19:49:46', '2026-09-16 19:49:46'),
(9, 'e7918b7e-b283-11f1-8f30-fd92e3be0bfd', 'Mohammad', '0566756645', NULL, 'غير محدد', NULL, NULL, 'حجز موعد', NULL, NULL, NULL, 'new', NULL, '2026-09-17 10:38:22', '2026-09-17 10:38:22'),
(10, '002f2169-b284-11f1-8f30-fd92e3be0bfd', 'Mohammad', '0566756645', NULL, 'Land Rover Defender', NULL, NULL, 'حجز موعد', NULL, NULL, NULL, 'new', NULL, '2026-09-17 10:39:03', '2026-09-17 10:39:03'),
(11, '0d8f7e63-b284-11f1-8f30-fd92e3be0bfd', 'Mohammad', '0566756645', NULL, 'Defender', NULL, NULL, 'حماية PPF', NULL, NULL, NULL, 'converted', NULL, '2026-09-17 10:39:25', '2026-09-17 13:44:10'),
(12, 'efa83475-b2c1-11f1-8f30-fd92e3be0bfd', 'ابو ريفان', '0565835603', NULL, 'هيونداي سوناتا', NULL, NULL, 'حماية كاملة - فرع جدة', NULL, NULL, NULL, 'new', NULL, '2026-09-17 18:02:24', '2026-09-17 18:04:06'),
(13, '7b99a00f-b9bd-11f1-9981-64ef84c75a6b', 'يوسف محمد عباس', '01027295412', NULL, 'دودج تشالنجر SRT', NULL, NULL, 'حماية نصف السيارة وعازل حراري', NULL, NULL, NULL, 'new', NULL, '2026-09-26 15:18:09', '2026-09-26 15:18:09'),
(14, 'f3652e87-bfe5-11f1-9981-64ef84c75a6b', 'ahmed', '556677889', NULL, 'bmw', 'e46', '2001', '7073ea5b-381a-11f1-9311-e4b97a51c3a0', NULL, '2026-10-14', '16:30:00', 'contacted', NULL, '2026-10-04 11:22:57', '2026-10-04 11:27:03'),
(15, '3d8ada3b-c633-11f1-9981-64ef84c75a6b', 'فهد', '0000', NULL, 'غير محدد', NULL, NULL, 'تظليل / عازل حراري', NULL, NULL, NULL, 'new', NULL, '2026-10-12 11:51:20', '2026-10-12 11:51:20'),
(16, '42bd2d17-c633-11f1-9981-64ef84c75a6b', 'فهد', '0000', NULL, 'شانجان', NULL, NULL, 'تظليل عازل حراري', NULL, NULL, NULL, 'new', NULL, '2026-10-12 11:51:29', '2026-10-12 11:51:29');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `max_uses` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `current_uses` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `uuid`, `code`, `discount_type`, `discount_value`, `max_uses`, `current_uses`, `valid_from`, `valid_to`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(11, '53d17420-a2ef-11f1-92b2-e4b97a51c3a0', 'REFLECTO-H72EZ2', 'fixed', 50.00, 100, 0, NULL, NULL, NULL, 1, 30, '2026-08-28 17:47:01', '2026-08-28 17:47:01'),
(12, 'fa18ec29-a2ef-11f1-92b2-e4b97a51c3a0', 'REFLECTO-9DD990', 'fixed', 500.00, 1, 0, NULL, NULL, 'Loyalty redemption: 500 pts → SAR 500', 1, 28, '2026-08-28 17:51:40', '2026-08-28 17:51:40'),
(13, 'da653df9-a8e6-11f1-ad47-e4b97a51c3a0', 'REFLECTO-ZYORAB', 'fixed', 100.00, 10, 0, NULL, NULL, NULL, 1, 48, '2026-09-05 08:01:28', '2026-09-05 08:01:28');

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_points`
--

CREATE TABLE `loyalty_points` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `total_points` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loyalty_points`
--

INSERT INTO `loyalty_points` (`id`, `client_id`, `total_points`, `updated_at`) VALUES
(35, 30, 100, '2026-08-23 11:42:40'),
(37, 28, 340, '2026-10-15 02:32:07'),
(70, 48, 300, '2026-09-03 00:33:32'),
(108, 50, 0, '2026-09-03 00:40:18'),
(109, 51, 0, '2026-09-11 03:31:15'),
(110, 57, 0, '2026-09-13 06:08:21'),
(111, 59, 0, '2026-09-13 11:51:55'),
(112, 60, 100, '2026-09-26 23:24:34'),
(115, 61, 0, '2026-09-16 11:24:12'),
(116, 62, 0, '2026-09-16 11:30:52'),
(117, 63, 0, '2026-09-16 12:48:11'),
(118, 64, 150, '2026-10-09 13:48:50'),
(120, 65, 0, '2026-10-06 05:38:38'),
(121, 66, 0, '2026-09-17 14:03:58'),
(122, 67, 50, '2026-09-18 17:45:40'),
(124, 68, 0, '2026-09-26 14:39:46'),
(125, 69, 50, '2026-09-26 21:42:21'),
(129, 52, 50, '2026-09-26 23:30:57'),
(130, 71, 0, '2026-09-26 23:38:39'),
(131, 72, 10, '2026-09-30 10:59:22'),
(132, 73, 0, '2026-09-30 11:15:55'),
(133, 74, 0, '2026-09-30 11:53:16'),
(135, 75, 0, '2026-10-09 16:17:54'),
(136, 76, 0, '2026-10-12 11:58:25');

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_transactions`
--

CREATE TABLE `loyalty_transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `from_user_id` int(10) UNSIGNED DEFAULT NULL,
  `to_user_id` int(10) UNSIGNED NOT NULL,
  `appointment_id` int(10) UNSIGNED DEFAULT NULL,
  `type` enum('earned','redeemed','transferred_out','transferred_in','gifted','awarded_by_admin','deducted_by_admin') NOT NULL DEFAULT 'earned',
  `points` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `work_order_uuid` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loyalty_transactions`
--

INSERT INTO `loyalty_transactions` (`id`, `from_user_id`, `to_user_id`, `appointment_id`, `type`, `points`, `description`, `created_at`, `work_order_uuid`) VALUES
(13, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-19 03:07:10', NULL),
(26, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-22 02:20:18', NULL),
(35, NULL, 30, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-22 13:39:49', NULL),
(37, NULL, 48, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-22 13:50:35', NULL),
(51, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 04:17:54', NULL),
(52, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 04:18:02', NULL),
(53, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 04:27:54', NULL),
(54, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 04:28:09', NULL),
(55, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 05:44:33', NULL),
(56, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 05:44:42', NULL),
(57, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 05:46:15', NULL),
(61, NULL, 28, NULL, 'transferred_in', 200, 'Received from menna mohamed', '2026-08-23 07:51:10', NULL),
(62, 28, 28, NULL, 'redeemed', -300, 'Redeemed 300 pts for coupon REFLECTO-7D3E42 (SAR 300 off)', '2026-08-23 07:51:42', NULL),
(63, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 07:52:00', NULL),
(64, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 08:40:18', NULL),
(65, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 08:43:13', NULL),
(66, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 10:07:53', NULL),
(67, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 11:10:44', NULL),
(68, NULL, 30, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-23 11:42:40', NULL),
(69, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-28 13:47:56', NULL),
(70, NULL, 28, NULL, 'earned', 50, 'Points earned from service purchase', '2026-08-28 13:49:29', NULL),
(71, NULL, 28, NULL, 'earned', 500, 'Admin manual adjustment', '2026-08-28 17:31:13', NULL),
(72, NULL, 28, NULL, 'earned', 300, 'Admin manual adjustment', '2026-08-28 17:31:22', NULL),
(73, 28, 28, NULL, 'redeemed', -500, 'Redeemed 500 pts for coupon REFLECTO-9DD990 (SAR 500 off)', '2026-08-28 17:51:40', NULL),
(74, 28, 28, NULL, 'transferred_out', -200, 'Transfer to ali mohamed', '2026-09-03 00:33:32', NULL),
(75, 28, 48, NULL, 'transferred_in', 200, 'Received from Ali Ahmed Mohamed', '2026-09-03 00:33:32', NULL),
(76, NULL, 60, NULL, 'earned', 50, 'Points earned from service purchase', '2026-09-13 12:16:58', NULL),
(77, NULL, 28, NULL, 'earned', 10, 'مكافأة تقييم الخدمة (+10 نقاط ولاء)', '2026-09-14 14:14:24', NULL),
(78, NULL, 64, NULL, 'earned', 10, 'مكافأة تقييم الخدمة (+10 نقاط ولاء)', '2026-09-16 19:40:11', NULL),
(79, NULL, 67, NULL, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-09-18 17:45:40', 'WO-260005'),
(80, NULL, 69, 109, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-09-26 21:42:21', 'WO-260006'),
(81, NULL, 60, 106, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-09-26 23:24:34', 'WO-260003'),
(82, NULL, 52, 110, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-09-26 23:30:57', 'WO-260007'),
(83, 61, 72, NULL, 'awarded_by_admin', 10, 'تعديل يدوية من لوحة التحكم', '2026-09-30 10:59:22', NULL),
(84, 60, 65, NULL, 'awarded_by_admin', 50, 'تعديل يدوية من لوحة التحكم', '2026-10-06 05:38:33', NULL),
(85, 60, 65, NULL, 'deducted_by_admin', -50, 'تعديل يدوية من لوحة التحكم', '2026-10-06 05:38:38', NULL),
(86, NULL, 64, 107, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-10-09 13:48:50', 'WO-260004'),
(87, NULL, 28, NULL, 'earned', 10, 'مكافأة تقييم الخدمة (+10 نقاط ولاء)', '2026-10-14 21:25:56', NULL),
(88, NULL, 28, 113, 'earned', 50, 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)', '2026-10-14 21:30:21', 'WO-260008'),
(89, NULL, 28, NULL, 'earned', 10, 'مكافأة تقييم الخدمة (+10 نقاط ولاء)', '2026-10-14 21:35:12', NULL),
(90, NULL, 28, NULL, 'earned', 10, 'مكافأة تقييم الخدمة (+10 نقاط ولاء)', '2026-10-15 02:32:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'SAR',
  `payment_method` enum('tabby','tamara','credit_card','cash') NOT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `appointment_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `uuid`, `user_id`, `amount`, `currency`, `payment_method`, `session_id`, `status`, `created_at`, `updated_at`, `appointment_id`) VALUES
(19, '2a7fbba0-3cd5-4786-b56b-497619fbe762', 28, 500.00, 'SAR', 'credit_card', 'TEST-1787098030254', 'completed', '2026-08-19 03:07:10', '2026-08-22 13:34:47', NULL),
(24, '80b87a2a-f187-466a-98fe-a034098f2d29', 30, 3500.00, 'SAR', 'tamara', NULL, 'failed', '2026-08-21 12:49:23', '2026-08-21 12:49:24', NULL),
(25, 'd0972ba8-4f3b-4fc0-b1e3-54fe364325a5', 30, 3500.00, 'SAR', 'tabby', '01a023b9-ac70-85d7-8518-0e0a16ff2b93', 'pending', '2026-08-21 12:49:27', '2026-08-21 12:49:28', NULL),
(26, 'd1902231-6d8d-4ec5-84ba-f8eb30a47095', 30, 3500.00, 'SAR', 'tabby', '01a025d7-40f8-8b73-ae18-c17656ab32f2', 'pending', '2026-08-21 22:41:00', '2026-08-21 22:41:01', NULL),
(40, 'f9b58e90-e7db-4b56-9e47-763bc49299c9', 28, 8500.00, 'SAR', 'tabby', NULL, 'failed', '2026-08-22 02:18:39', '2026-08-22 02:18:42', NULL),
(41, '2f313e68-d542-456f-848c-5cc6b64cca68', 28, 8500.00, 'SAR', 'tamara', '871fe966-7191-491e-bba0-46c091a7e91c', 'pending', '2026-08-22 02:18:44', '2026-08-22 02:18:44', NULL),
(42, '42a508b3-c796-4aaf-953b-05991754ad67', 28, 8500.00, 'SAR', 'tabby', NULL, 'failed', '2026-08-22 02:19:16', '2026-08-22 02:19:18', NULL),
(43, 'b0c34617-ce46-4e81-b928-ef8bca994300', 28, 8500.00, 'SAR', 'tabby', NULL, 'failed', '2026-08-22 02:20:09', '2026-08-22 02:20:10', NULL),
(44, '7db14545-e375-4168-8057-9ec7ce5ebe07', 28, 8500.00, 'SAR', 'tamara', '3e66e7fd-2ede-4b55-9d36-8e937cdd2deb', 'pending', '2026-08-22 02:20:11', '2026-08-22 02:20:12', NULL),
(45, 'eebce817-6331-4a1b-a0e2-76445944954c', 28, 8500.00, 'SAR', 'credit_card', 'TEST-1787354418161', 'completed', '2026-08-22 02:20:18', '2026-08-22 13:34:41', NULL),
(46, 'e3bd3f4d-4a44-483e-a899-04afe577b0a0', 28, 1199.00, 'SAR', 'tabby', '01a026a3-b8b8-8b04-8d1c-50f676e6fd4d', 'pending', '2026-08-22 02:24:21', '2026-08-22 02:24:21', NULL),
(47, '0e45c863-98cd-481b-87f3-38a3e5177271', 28, 1199.00, 'SAR', 'tamara', 'f9bd6b46-a655-4d61-9089-15bafe9aa9d5', 'pending', '2026-08-22 02:24:31', '2026-08-22 02:24:31', NULL),
(48, '8c4b4d17-be0d-4916-8c70-9eb68c6539f8', 30, 3500.00, 'SAR', 'tabby', '01a0274a-7068-8eed-9319-9f2e75e0b53d', 'pending', '2026-08-22 05:26:24', '2026-08-22 05:26:25', NULL),
(49, 'fdf64a96-abb2-4e5b-9cc1-4491d0d0eaf3', 30, 3500.00, 'SAR', 'tamara', '2ad17dd5-2043-4ba0-9e0f-176578afc995', 'pending', '2026-08-22 05:26:34', '2026-08-22 05:26:35', NULL),
(50, '8a08190f-0cd2-4825-be1d-9b5b3cae0556', NULL, 8500.00, 'SAR', 'tamara', '4ccefd97-7fbb-40d1-9b37-a2361181d2dc', 'pending', '2026-08-22 05:41:34', '2026-08-22 05:41:35', NULL),
(52, 'a4819f0b-8106-4816-930f-3e37ce117454', 28, 3500.00, 'SAR', 'tabby', '01a02767-d7c0-8536-a81d-46487de14c82', 'pending', '2026-08-22 05:58:29', '2026-08-22 05:58:32', NULL),
(53, '6e67d9df-90b8-4922-8ea2-1fc24cf01eda', 28, 3500.00, 'SAR', 'tamara', '5c73dbf6-0e1d-47e9-894a-6a1ccd105b4f', 'pending', '2026-08-22 05:58:37', '2026-08-22 05:58:42', NULL),
(61, '3261196f-0910-40f9-b94e-9681e429fa6e', 30, 1199.00, 'SAR', 'credit_card', 'TEST-1787395189896', 'completed', '2026-08-22 13:39:49', '2026-08-22 13:41:09', NULL),
(63, '871e7849-f1d7-40ec-94ac-23f69487f94d', 48, 3500.00, 'SAR', 'credit_card', 'TEST-1787395835907', 'completed', '2026-08-22 13:50:35', '2026-08-22 15:00:44', NULL),
(64, 'ebbcef6d-eb67-4fc1-aa21-8c9c57f3b3e9', NULL, 600.00, 'SAR', 'credit_card', 'TEST-1787399888265', 'completed', '2026-08-22 14:58:08', '2026-08-22 15:00:28', NULL),
(65, '64e8ecae-312a-4260-9956-ba28878335de', NULL, 1500.00, 'SAR', 'credit_card', 'TEST-1787400428050', 'completed', '2026-08-22 15:07:08', '2026-08-23 04:29:00', NULL),
(66, '0da6debe-9e24-11f1-8494-e4b97a51c3a0', NULL, 2000.00, 'SAR', 'cash', 'WO-WO-574732', 'completed', '2026-08-22 15:21:51', '2026-08-23 04:29:03', NULL),
(67, '2681cc20-9554-4092-92e2-fdc9d5fc1038', NULL, 1500.00, 'SAR', 'credit_card', 'TEST-1787402866423', 'completed', '2026-08-22 15:47:46', '2026-08-23 04:28:57', NULL),
(68, 'da3dc85c-e35e-44af-a173-6b6405c11b5f', NULL, 1099.00, 'SAR', 'credit_card', 'TEST-1787403190201', 'completed', '2026-08-22 15:53:10', '2026-08-23 04:28:54', NULL),
(69, 'fff28177-a4c6-4ead-ae63-d7c45d1ca98d', NULL, 8500.00, 'SAR', 'tabby', NULL, '', '2026-08-23 03:21:23', '2026-08-23 04:29:07', NULL),
(70, '9d201011-75b2-4483-806c-c0aac1dd2031', NULL, 8500.00, 'SAR', 'tabby', NULL, '', '2026-08-23 03:21:39', '2026-08-23 04:28:49', NULL),
(71, 'd4579132-b397-4359-a9d4-ddff6c11cf00', NULL, 8500.00, 'SAR', 'tamara', '51e644db-04cf-4cb1-a491-7a0998b6f95f', 'pending', '2026-08-23 03:21:41', '2026-08-23 04:28:39', NULL),
(72, 'df92b219-f7f7-4221-88f0-4e2cb7e16b11', NULL, 3500.00, 'SAR', 'tabby', '01a02bff-26a8-827b-9b1a-08684f823241', 'pending', '2026-08-23 03:22:17', '2026-08-23 04:28:41', NULL),
(73, '440d0804-da18-4553-ae11-1031cadc76c4', NULL, 8500.00, 'SAR', 'tabby', NULL, '', '2026-08-23 04:14:37', '2026-08-23 04:28:43', NULL),
(74, '292f2ee2-51ba-4afd-9892-ae5a7a5f3ce4', NULL, 1199.00, 'SAR', 'tabby', '01a02c2f-27b8-83de-9511-13d499b27e93', 'pending', '2026-08-23 04:14:44', '2026-08-23 04:28:46', NULL),
(75, '28e44688-982e-4348-8790-a528d3aa670e', 28, 1199.00, 'SAR', 'tabby', '01a02c32-11d0-84f7-a21b-3edd198ab638', 'pending', '2026-08-23 04:17:54', '2026-08-23 04:18:52', NULL),
(76, 'bab2c53f-38e3-42d9-9c27-e864d396070a', 28, 1199.00, 'SAR', 'credit_card', 'TEST-1787447882323', 'completed', '2026-08-23 04:18:02', '2026-08-23 04:18:55', NULL),
(77, '01ccb2ab-9e91-11f1-b96c-e4b97a51c3a0', 28, 1700.00, 'SAR', 'cash', 'WO-WO-574733', 'completed', '2026-08-23 04:21:46', '2026-08-23 04:22:42', NULL),
(78, '6dd9e8ee-b621-42d6-96da-31c391a3c309', 28, 300.00, 'SAR', 'credit_card', 'TEST-1787448474247', 'completed', '2026-08-23 04:27:54', '2026-08-23 04:28:34', NULL),
(79, '1d94df52-609e-4210-ba96-a9501b461984', 28, 300.00, 'SAR', 'credit_card', 'TEST-1787448489403', 'completed', '2026-08-23 04:28:09', '2026-08-23 04:28:32', NULL),
(80, '9d8c388e-2463-43b6-a1e0-dfff5456ed68', 28, 1199.00, 'SAR', 'tabby', '01a02c81-6280-8975-8c1e-fd894cd0d35a', 'pending', '2026-08-23 05:44:33', '2026-08-23 05:45:49', NULL),
(81, 'f87d3184-a837-4f48-a6a2-2c29b1ceaa3f', 28, 1199.00, 'SAR', 'credit_card', 'TEST-1787453082285', 'completed', '2026-08-23 05:44:42', '2026-08-23 05:45:50', NULL),
(82, '0865b5a2-d2f1-4425-b7d2-c314c643599e', 28, 1199.00, 'SAR', 'credit_card', 'TEST-1787453175418', 'completed', '2026-08-23 05:46:15', '2026-08-23 06:27:34', NULL),
(83, 'f4d09018-9ead-11f1-b96c-e4b97a51c3a0', 28, 2000.00, 'SAR', '', 'WO-WO-260000', 'completed', '2026-08-23 07:48:59', '2026-09-01 04:30:32', NULL),
(84, 'fb03e306-c5fd-4a6a-a69b-d5ff1a6b8c8a', NULL, 8500.00, 'SAR', 'credit_card', 'TEST-1787460610185', 'completed', '2026-08-23 07:50:10', '2026-08-23 08:37:06', NULL),
(85, '09582b8b-a9e1-4bc2-a04c-6f022b1a7e80', 28, 115.00, 'SAR', 'credit_card', 'TEST-1787460720793', 'completed', '2026-08-23 07:52:00', '2026-08-23 08:37:08', NULL),
(86, 'bcd23c8b-f6bb-45c4-80bb-105711b8fa23', 28, 430.00, 'SAR', 'credit_card', 'TEST-1787463618287', 'completed', '2026-08-23 08:40:18', '2026-08-23 08:41:20', NULL),
(87, '3669c775-fc5f-4196-8075-0a831d857019', 28, 530.00, 'SAR', 'credit_card', 'TEST-1787463793215', 'completed', '2026-08-23 08:43:13', '2026-08-23 08:43:13', NULL),
(88, '76c94224-31e2-4a1b-85d8-8c45db08f2a4', 28, 530.00, 'SAR', 'credit_card', 'TEST-1787468873872', 'completed', '2026-08-23 10:07:53', '2026-08-23 11:08:54', NULL),
(89, '51db9d44-c93b-411d-a128-a2e4c86f22c2', 28, 300.00, 'SAR', 'credit_card', 'TEST-1787472644547', 'completed', '2026-08-23 11:10:44', '2026-08-23 11:34:25', NULL),
(90, '7ef5a2cb-a394-4854-a259-1634cc4572b0', 28, 225.00, 'SAR', 'credit_card', 'TEST-1787474174581', 'completed', '2026-08-23 11:36:14', '2026-08-23 11:36:14', NULL),
(91, 'be359c10-8b7a-4775-a4d5-b54dac3c23f3', 30, 1199.00, 'SAR', 'tabby', '01a02dc9-4400-87d5-a91b-3d56478cf6e5', 'pending', '2026-08-23 11:42:40', '2026-08-28 13:22:14', NULL),
(92, 'e1184041-9eee-11f1-9acd-e4b97a51c3a0', NULL, 1000.00, 'SAR', 'cash', 'WO-WO-260001', 'completed', '2026-08-23 15:33:44', '2026-08-28 13:22:15', NULL),
(93, 'd4790b8a-a2c6-11f1-92b2-e4b97a51c3a0', 28, 1500.00, 'SAR', '', 'WO-WO-260001', 'completed', '2026-08-28 12:57:07', '2026-09-03 01:16:35', NULL),
(94, 'e717b8a9-a2c8-11f1-92b2-e4b97a51c3a0', NULL, 2500.00, 'SAR', 'cash', 'WO-WO-260002', 'completed', '2026-08-28 13:11:57', '2026-08-28 13:22:09', NULL),
(95, '0f935fe6-a2c9-11f1-92b2-e4b97a51c3a0', 48, 1800.00, 'SAR', 'cash', 'WO-WO-260003', 'completed', '2026-08-28 13:13:05', '2026-08-28 13:22:17', NULL),
(96, '85721f2f-b563-4715-9f88-ef3f8c6781d4', 28, 1199.00, 'SAR', 'tabby', '01a047fb-bf60-8784-a716-6de79ec350bd', 'pending', '2026-08-28 13:47:56', '2026-08-28 14:38:08', NULL),
(97, '86006328-0dc6-4e12-acfc-1c37ccffe795', 28, 1199.00, 'SAR', 'tamara', 'dea116aa-0d86-48b4-a8ab-0a4643a3e754', 'pending', '2026-08-28 13:49:29', '2026-08-28 14:38:11', NULL),
(98, '6f979f4a-2d9f-4b95-bc98-3d4ce77ac8e2', 28, 415.00, 'SAR', 'credit_card', 'TEST-1787959736539', 'completed', '2026-08-29 02:28:56', '2026-08-29 02:28:56', NULL),
(99, '86c8661d-6163-4f63-a90e-233ccd3b6f05', 28, 300.00, 'SAR', 'credit_card', 'TEST-1788226337043', 'completed', '2026-09-01 04:32:17', '2026-09-01 04:32:17', NULL),
(100, '7a50e845-c14b-400d-81ae-59432502ec39', 28, 415.00, 'SAR', 'credit_card', 'TEST-1788230298017', 'completed', '2026-09-01 05:38:18', '2026-09-01 05:38:18', NULL),
(101, 'eacf2feb-7c14-4a10-b329-6bd7cdafa02f', 28, 225.00, 'SAR', 'credit_card', 'TEST-1788232417872', 'completed', '2026-09-01 06:13:37', '2026-09-01 06:13:37', NULL),
(102, '774f0813-6464-4373-8a77-c19a7b92a417', 28, 225.00, 'SAR', 'credit_card', 'TEST-1788232868872', 'completed', '2026-09-01 06:21:08', '2026-09-01 06:21:08', NULL),
(103, '7aa25fad-cfa3-4db4-b7cf-c219765a2ac0', 28, 225.00, 'SAR', 'tabby', '01a060d4-a600-8732-a717-0d9691ffa593', 'pending', '2026-09-02 09:35:40', '2026-09-02 09:35:45', NULL),
(104, 'b1ca2e8c-1eae-425b-a848-4a4d950add7a', 28, 225.00, 'SAR', 'credit_card', 'TEST-1788330956328', 'completed', '2026-09-02 09:35:56', '2026-09-02 09:35:56', NULL),
(105, '32dd60bb-2111-4691-81f5-50f5def65d65', 30, 3500.00, 'SAR', 'tabby', '01a060d6-d880-8952-9a1f-4e0a8539d816', 'pending', '2026-09-02 09:38:08', '2026-09-02 23:38:12', NULL),
(106, 'c7c1aa1a-9c2b-4d9c-ae6d-966c323fbfb3', 28, 300.00, 'SAR', 'credit_card', 'TEST-1788384202252', 'completed', '2026-09-03 00:23:22', '2026-09-03 00:23:22', NULL),
(107, '13a42bb7-77c9-4db4-adc5-105781995069', 28, 255.00, 'SAR', 'tabby', '01a0641f-6430-8c4e-951c-181d71983df7', 'pending', '2026-09-03 00:56:11', '2026-09-03 00:56:16', NULL),
(108, 'aec0b7a0-dab2-40c9-ba10-0f8738506afa', 28, 225.00, 'SAR', 'credit_card', 'TEST-1788387821977', 'completed', '2026-09-03 01:23:41', '2026-09-03 01:23:41', NULL),
(109, 'dd72bf47-3c8d-419b-a0be-9697743b7f4e', 28, 1199.00, 'SAR', 'tabby', '01a0643a-00b0-8537-931e-efad8cb1d465', 'pending', '2026-09-03 01:25:18', '2026-09-03 21:19:57', NULL),
(110, '0d841a1c-7ce6-4ed9-b1d2-21c0f3b237dc', 28, 225.00, 'SAR', 'tabby', '01a06c8f-8c30-824a-9711-680a303c1a6a', 'pending', '2026-09-04 16:15:44', '2026-09-04 16:15:44', NULL),
(111, '451558bd-8105-41a8-81af-5a9bae7a4b3a', 28, 300.00, 'SAR', 'tabby', '01a06d10-58d8-8c00-9c1a-ac194b59ed2f', 'pending', '2026-09-04 18:36:23', '2026-09-04 18:36:24', NULL),
(112, '895c1bfd-e1ec-43e7-8f21-f06cf0f97f5f', 28, 300.00, 'SAR', 'credit_card', 'TEST-1788536189916', 'completed', '2026-09-04 18:36:29', '2026-09-04 18:36:29', NULL),
(113, '41e2fc56-c3ad-4be9-805e-242983359837', 28, 300.00, 'SAR', 'tabby', '01a06d22-13e8-8fff-9215-f048739b7929', 'pending', '2026-09-04 18:55:45', '2026-09-04 18:55:46', NULL),
(114, 'a88e5415-ef1f-4991-9286-3f5d8a22fc9b', 28, 300.00, 'SAR', 'tabby', '01a06d93-5be8-8037-b81a-66896f12b71f', 'pending', '2026-09-04 20:59:29', '2026-09-04 20:59:30', NULL),
(115, 'e6c78581-203a-4201-b19d-8d9805ea9a8c', 28, 300.00, 'SAR', 'credit_card', 'TEST-1788544806299', 'completed', '2026-09-04 21:00:06', '2026-09-04 21:00:06', NULL),
(116, '9fa0fe94-3438-46f1-a064-cf95f91c5951', 28, 415.00, 'SAR', 'credit_card', 'TEST-1788548243906', 'completed', '2026-09-04 21:57:23', '2026-09-04 21:57:23', NULL),
(117, '3a974890-bc67-406a-b45b-8a22160e7837', 28, 225.00, 'SAR', 'credit_card', 'TEST-1788551413069', 'completed', '2026-09-04 22:50:13', '2026-09-04 22:50:13', NULL),
(118, '816e4ab2-625d-4654-8b81-3f636651e0f5', 28, 205.30, 'SAR', 'credit_card', 'TEST-1788567508371', 'completed', '2026-09-05 03:18:28', '2026-09-05 03:18:28', NULL),
(119, '8b063c01-18ca-4027-b312-1f3cd72d4c25', 28, 300.00, 'SAR', 'credit_card', 'TEST-1788576067905', 'completed', '2026-09-05 05:41:07', '2026-09-05 05:41:07', NULL),
(120, '08ef9476-3613-4af5-95b6-cc04b8fac81f', 28, 405.00, 'SAR', 'credit_card', 'TEST-1789087177016', 'completed', '2026-09-11 03:39:37', '2026-09-11 03:39:37', NULL),
(121, '14079ec7-a82e-4c70-9eaf-8232557bfbc2', 28, 405.00, 'SAR', 'credit_card', 'TEST-1789087388060', 'completed', '2026-09-11 03:43:08', '2026-09-11 03:43:08', NULL),
(122, 'bc61c48c-1ccc-4713-833a-0d42165978b5', NULL, 0.00, 'SAR', 'credit_card', 'TEST-1789168942700', 'completed', '2026-09-12 02:22:22', '2026-09-12 02:22:22', NULL),
(123, 'afcb790a-6beb-4249-af73-745755f01fe6', NULL, 0.00, 'SAR', 'credit_card', 'TEST-1789169870152', 'completed', '2026-09-12 02:37:50', '2026-09-12 02:37:50', NULL),
(124, 'ea6cddbd-af50-11f1-b237-e4b97a51c3a0', 60, 2546.10, 'SAR', '', 'WO-WO-260002', 'completed', '2026-09-13 11:55:49', '2026-09-13 11:55:49', NULL),
(125, '9436ed09-af62-11f1-b237-e4b97a51c3a0', 60, 1414.50, 'SAR', '', 'WO-WO-260003', 'completed', '2026-09-13 14:02:15', '2026-09-13 14:02:15', 106),
(126, 'f921ae21-b204-11f1-8f30-fd92e3be0bfd', 64, 1000.00, 'SAR', '', 'WO-WO-260004', 'completed', '2026-09-16 19:29:45', '2026-09-16 19:29:45', 107),
(127, 'c393139a-b388-11f1-8f30-fd92e3be0bfd', 67, 2000.00, 'SAR', '', 'WO-WO-260005', 'completed', '2026-09-18 17:45:40', '2026-09-18 17:45:40', NULL),
(128, '277cf680-b9f3-11f1-9981-64ef84c75a6b', 69, 1000.00, 'SAR', '', 'WO-WO-260006', 'completed', '2026-09-26 21:42:21', '2026-09-26 21:42:21', 109),
(129, '6cf62eba-de48-4ea2-9033-30ae8af1b10e', 69, 4750.00, 'SAR', 'credit_card', 'TEST-1790459020036', 'completed', '2026-09-26 21:43:40', '2026-09-26 21:43:40', NULL),
(130, '9efe1806-5222-4e34-a2c3-9230a06e75ff', 69, 4750.00, 'SAR', 'tamara', 'a2784cd6-d6b4-4def-a5be-d913b25f5222', 'pending', '2026-09-26 21:43:54', '2026-09-26 21:43:55', NULL),
(131, '537742ef-ba02-11f1-9981-64ef84c75a6b', 52, 2452.95, 'SAR', '', 'WO-WO-260007', 'completed', '2026-09-26 23:30:57', '2026-09-26 23:30:57', 110),
(132, '4fdd353d-96b0-4820-ab10-c08da7ea53c5', 71, 493.00, 'SAR', 'credit_card', 'TEST-1790465919186', 'completed', '2026-09-26 23:38:39', '2026-09-26 23:38:39', NULL),
(133, 'c19904cf-0ead-4d48-82b8-f9a45a21413e', 61, 1199.00, 'SAR', 'tabby', '01a131ea-7378-8d1b-bd1f-a44bf4a9a5c9', 'pending', '2026-10-12 21:00:11', '2026-10-12 21:00:12', 112),
(134, '75c29b85-c816-11f1-9981-64ef84c75a6b', 28, 1320.20, 'SAR', '', 'WO-WO-260008', 'completed', '2026-10-14 21:30:21', '2026-10-14 21:30:21', 113);

-- --------------------------------------------------------

--
-- Table structure for table `pricing_tiers`
--

CREATE TABLE `pricing_tiers` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `slug` varchar(50) NOT NULL,
  `name_en` varchar(50) NOT NULL,
  `name_ar` varchar(50) DEFAULT NULL,
  `tagline_en` varchar(255) DEFAULT NULL,
  `tagline_ar` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'SAR',
  `warranty_years` int(10) UNSIGNED DEFAULT NULL,
  `is_popular` tinyint(1) NOT NULL DEFAULT 0,
  `features_en` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features_en`)),
  `features_ar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features_ar`)),
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `service_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pricing_tiers`
--

INSERT INTO `pricing_tiers` (`id`, `uuid`, `slug`, `name_en`, `name_ar`, `tagline_en`, `tagline_ar`, `price`, `currency`, `warranty_years`, `is_popular`, `features_en`, `features_ar`, `sort_order`, `service_id`, `client_id`) VALUES
(1, '707a8d8a-381a-11f1-9311-e4b97a51c3a0', 'basic', 'الباقة الأساسية', 'الباقة الأساسية', 'حماية أساسية للإستخدام اليومي', 'حماية أساسية للإستخدام اليومي', 1199.00, 'SAR', 5, 0, '[\"تركيب عازل حراري أمريكي بتقنية النانو سيراميك \",\" لأطراف الأبواب والشمعات وتحت المقابض  PPF تركيب حماية \",\"حماية نانو سيسراميك على كامل الهيكل الخارجي \",\"حماية نانو سيراميك على الطبلون والمقاعد\",\"حماية نانو سيراميك على الجنوط\"]', '[\"تركيب عازل حراري أمريكي بتقنية النانو سيراميك \",\" لأطراف الأبواب والشمعات وتحت المقابض  PPF تركيب حماية \",\"حماية نانو سيسراميك على كامل الهيكل الخارجي \",\"حماية نانو سيراميك على الطبلون والمقاعد\",\"حماية نانو سيراميك على الجنوط\"]', 1, NULL, NULL),
(2, '707aac21-381a-11f1-9311-e4b97a51c3a0', 'silver', 'الباقة الذهبية', 'الباقة الذهبية', 'حماية نصف السيارة ', 'حماية نصف السيارة ', 3500.00, 'SAR', 5, 1, '[\"Front bumper protection\",\"Luxury glass tinting\",\"5-year warranty\",\"Full car body polishing\",\"Nano ceramic coating on the entire car body\"]', '[\"حماية المصد الأمامي\",\"تظليل زجاج فاخر\",\"ضمان ٥ سنوات\",\"تلميع كامل هيكل السيارة\",\"نانو سيراميك على كامل هيكل السيارة \"]', 2, NULL, NULL),
(3, '707aafd0-381a-11f1-9311-e4b97a51c3a0', 'diamond', 'الباقة الماسية', 'الباقة الماسية', 'الحماية القصوى للسيارات الفاخرة', 'الحماية القصوى للسيارات الفاخرة', 8500.00, 'SAR', 5, 0, '[\"تركيب فيلم حماية بتقنية النانو سيراميك على كامل هيكل السيارة\",\"عازل حراري أمريكي بتقنية النانو سيراميك\",\"نانو داخلى على الطبلون والابواب\",\"نانو سيراميك على الجنوط\"]', '[\"تركيب فيلم حماية بتقنية النانو سيراميك على كامل هيكل السيارة\",\"عازل حراري أمريكي بتقنية النانو سيراميك\",\"نانو داخلى على الطبلون والابواب\",\"نانو سيراميك على الجنوط\"]', 0, NULL, NULL),
(4, '85203c6f-64f5-11f1-acc7-0929b6133efc', 'nano', 'باقة الحماية الكاملة', 'باقة الحماية الكاملة', 'Test', 'تيست', 8500.00, 'SAR', 5, 0, '[\"تركيب فيلم حماية بتقنية النانو على كامل هيكل السيارة\",\"عازل حراري أمريكي بتقنية النانو سيراميك \",\"نانو داخلى على الطبلون والابواب \",\"نانو سيراميك على الجنوط \"]', '[\"تركيب فيلم حماية بتقنية النانو على كامل هيكل السيارة \",\"عازل حراري أمريكي بتقنية النانو سيراميك \",\"نانو داخلى على الطبلون والابواب \",\"نانو سيراميك على الجنوط \"]', 0, 1, NULL),
(5, 'f8488f93-65d9-11f1-acc7-0929b6133efc', '-------', 'تركيب عازل حراري أمريكي بتقنية النانو سيراميك ', 'تركيب عازل حراري أمريكي بتقنية النانو سيراميك ', ' عازل حراري أمريكي بتقنية النانو سيراميك يعزل حتى ٩٥٪ من الأشعة الفوق بنفسجية ', ' عازل حراري أمريكي بتقنية النانو سيراميك يعزل حتى ٩٥٪ من الأشعة الفوق بنفسجية ', 610.00, 'SAR', 5, 0, '[\"عازل حراري أمريكي \",\"مدعم بتقنية النانو سيراميك \",\"يعزل حتى ٩٥٪ من الأشعة فوق البنفسجية\"]', '[\"عازل حراري أمريكي \",\"مدعم بتقنية النانو سيراميك \",\"يعزل حتى ٩٥٪ من الأشعة فوق البنفسجية\"]', 0, 4, NULL),
(6, '484ef216-65e2-11f1-acc7-0929b6133efc', '----', 'باقة التلميع الخارجي  ', 'باقة التلميع الخارجي  ', 'باقة التلميع الاحترافية', 'باقة التلميع الاحترافية', 575.00, 'SAR', NULL, 0, '[\"تلميع عميق \",\"ازالة دوائر الغسيل \",\"ازالة الخدوش السطحية \"]', '[\"تلميع عميق \",\"ازالة دوائر الغسيل \",\"ازالة الخدوش السطحية \"]', 0, 3, NULL),
(7, '39179514-65e4-11f1-acc7-0929b6133efc', '--', 'حماية نصف السيارة', 'حماية نصف السيارة', 'حماية نصف السيارة', 'حماية نصف السيارة ', 3500.00, 'SAR', 5, 0, '[\"حماية المصد الأمامي\",\"تظليل زجاج فاخر\",\"ضمان ٥ سنوات\",\"تلميع كامل هيكل السيارة\",\"نانو سيراميك على كامل هيكل السيارة\"]', '[\"حماية المصد الأمامي\",\"تظليل زجاج فاخر\",\"ضمان ٥ سنوات\",\"تلميع كامل هيكل السيارة\",\"نانو سيراميك على كامل هيكل السيارة\"]', 0, 1, NULL),
(8, 'cacf30de-65e4-11f1-acc7-0929b6133efc', '-----', 'حماية الاطراف والشمعات وتحت المقابض', 'حماية الاطراف والشمعات وتحت المقابض', NULL, NULL, 1199.00, 'SAR', 5, 0, '[\"تركيب عازل حراري أمريكي بتقنية النانو سيراميك \",\" تركيب حماية PPF لأطراف الأبواب والشمعات وتحت المقابض\",\"حماية نانو سيراميك على كامل الهيكل الخارجي\",\"حماية نانو سيراميك على الطبلون والمقاعد\",\"حماية نانو سيراميك على الجنوط\"]', '[\"تركيب عازل حراري أمريكي بتقنية النانو سيراميك\",\" تركيب حماية PPF لأطراف الأبواب والشمعات وتحت المقابض\",\"حماية نانو سيراميك على كامل الهيكل الخارجي\",\"حماية نانو سيراميك على الطبلون والمقاعد\",\"حماية نانو سيراميك على الجنوط\"]', 0, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `uuid`, `name`, `slug`, `description`, `permissions`, `created_at`, `updated_at`) VALUES
(1, '0e209ad2-b0dd-11f1-b73b-e4b97a51c3a0', 'مدير فرع', 'branch_manager', 'صلاحية لعرض كافة الصفحات والتقارير دون التعديل أو الإضافة', '{\"view_overview\":true,\"view_orders\":true,\"view_appointments\":true,\"view_contact_requests\":true,\"view_clients\":true,\"view_client_details\":true,\"view_employees\":true,\"view_companies\":true,\"view_packages\":false,\"view_coupons\":true,\"view_reviews\":true,\"view_billing\":false,\"view_checklists\":true,\"create_client\":true,\"edit_client\":true,\"delete_client\":false,\"create_order\":false,\"edit_order\":false,\"manage_companies\":false,\"manage_packages\":false,\"manage_coupons\":true,\"manage_ai\":false,\"create_checklist\":true,\"edit_checklist\":true,\"manage_permissions\":false,\"edit_appointment\":true,\"view_scheduling\":true,\"view_quotations\":true,\"create_quotation\":true,\"view_order_details\":true}', '2026-09-15 11:11:29', '2026-10-04 21:48:37'),
(2, '0e20aa8c-b0dd-11f1-b73b-e4b97a51c3a0', 'مشرف فرع', 'branch_supervisor', 'مشرف فرع مع إمكانية متابعة العمليات', '{\"view_overview\":true,\"view_orders\":true,\"view_appointments\":true,\"view_contact_requests\":true,\"view_clients\":true,\"view_client_details\":true,\"view_employees\":true,\"view_companies\":false,\"view_packages\":false,\"view_coupons\":true,\"view_reviews\":false,\"view_billing\":false,\"view_checklists\":true,\"create_client\":true,\"edit_client\":true,\"delete_client\":true,\"create_order\":false,\"edit_order\":false,\"manage_companies\":false,\"manage_packages\":false,\"manage_coupons\":false,\"manage_ai\":false,\"create_checklist\":true,\"edit_checklist\":true,\"manage_permissions\":false,\"create_employee\":true,\"edit_employee\":true,\"delete_employee\":true,\"view_scheduling\":true}', '2026-09-15 11:11:29', '2026-09-20 13:20:26'),
(3, 'e467357e-b4f5-11f1-8f30-fd92e3be0bfd', 'مسئول عام', 'role_1789910361714', '', '{\"view_overview\":true,\"view_checklists\":true,\"create_checklist\":true,\"edit_checklist\":true,\"delete_checklist\":false,\"view_clients\":true,\"view_client_details\":true,\"create_client\":true,\"edit_client\":true,\"delete_client\":true,\"view_employees\":true,\"create_employee\":true,\"edit_employee\":true,\"delete_employee\":true,\"view_companies\":true,\"manage_companies\":true,\"view_packages\":true,\"manage_packages\":true,\"view_appointments\":true,\"view_scheduling\":true,\"view_billing\":false,\"manage_coupons\":false,\"manage_ai\":false,\"view_reviews\":false,\"view_contact_requests\":true,\"manage_permissions\":true,\"view_order_details\":true,\"view_quotations\":true,\"edit_quotation\":false,\"delete_quotation\":true,\"create_quotation\":false,\"edit_appointment\":true,\"delete_appointment\":true}', '2026-09-20 13:19:21', '2026-10-08 21:43:17');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `slug` varchar(100) NOT NULL,
  `name_en` varchar(150) NOT NULL,
  `name_ar` varchar(150) DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `uuid`, `slug`, `name_en`, `name_ar`, `description_en`, `description_ar`, `is_active`) VALUES
(1, '7073cf67-381a-11f1-9311-e4b97a51c3a0', 'ppf', 'Paint Protection Film', 'فيلم حماية الطلاء', 'High-quality self-healing paint protection film', 'فيلم حماية الطلاء ذاتي الإصلاح عالي الجودة', 1),
(2, '7073ea5b-381a-11f1-9311-e4b97a51c3a0', 'nano-ceramic', 'Nano Ceramic Coating', 'طلاء سيراميك نانو', '9H hardness nano ceramic coating for ultimate protection', 'طلاء سيراميك نانو بصلابة 9H للحماية القصوى', 1),
(3, '7073ecab-381a-11f1-9311-e4b97a51c3a0', 'paint-correction', 'Paint Correction', 'تصحيح الطلاء', 'Multi-stage paint correction to restore shine', 'تصحيح الطلاء متعدد المراحل لاستعادة اللمعان', 1),
(4, '7073eeb1-381a-11f1-9311-e4b97a51c3a0', 'window-tint', 'Window Tinting', 'تظليل الزجاج', 'Premium ceramic window tinting for UV protection', 'تظليل زجاج سيراميك فاخر للحماية من الأشعة فوق البنفسجية', 1),
(5, '7073f06d-381a-11f1-9311-e4b97a51c3a0', 'dash-cam', 'Dash Cam Installation', 'تركيب كاميرا داش', 'Professional dash camera installation front and rear', 'تركيب كاميرا داش احترافية أمامية وخلفية', 1),
(6, '7073f1c4-381a-11f1-9311-e4b97a51c3a0', 'thermal-insulation', 'Thermal Insulation', 'عازل حراري', 'Full vehicle thermal insulation treatment', 'معالجة العزل الحراري الكاملة للسيارة', 1);

-- --------------------------------------------------------

--
-- Table structure for table `service_reviews`
--

CREATE TABLE `service_reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `user_id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED DEFAULT NULL,
  `appointment_id` int(10) UNSIGNED DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `points_awarded` int(10) UNSIGNED DEFAULT 10,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rating_quality` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `rating_staff` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `rating_timing` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `rating_system` tinyint(3) UNSIGNED NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_reviews`
--

INSERT INTO `service_reviews` (`id`, `uuid`, `user_id`, `order_id`, `appointment_id`, `branch_name`, `rating`, `comment`, `points_awarded`, `created_at`, `updated_at`, `rating_quality`, `rating_staff`, `rating_timing`, `rating_system`) VALUES
(1, '62be9053-b02b-11f1-8133-e4b97a51c3a0', 28, NULL, NULL, 'فرع مكة المكرمة', 5, 'خدمة التظليل والنانو ممتازة جداً والفنيين محترفين ونظيفين بالعمل.', 10, '2026-09-01 14:30:00', '2026-09-14 13:59:41', 5, 5, 5, 5),
(2, '62bee493-b02b-11f1-8133-e4b97a51c3a0', 50, NULL, NULL, 'فرع جدة', 5, 'حماية الـ PPF ممتازة جداً وتسليم على الوقت، شكراً لمركز ريفليكتو.', 10, '2026-09-05 11:15:00', '2026-09-14 13:59:41', 5, 5, 5, 5),
(3, '62bf2d49-b02b-11f1-8133-e4b97a51c3a0', 52, NULL, NULL, 'فرع مكة المكرمة', 4, 'تجربة رائعة وتغيير ملحوظ في الحرارة مع العازل الحراري.', 10, '2026-09-08 16:45:00', '2026-09-14 13:59:41', 5, 5, 5, 5),
(4, '62bf7e62-b02b-11f1-8133-e4b97a51c3a0', 53, NULL, NULL, 'فرع جدة', 5, 'تعامل راقي جداً واهتمام بأدق التفاصيل في سيارتي.', 10, '2026-09-10 18:20:00', '2026-09-14 13:59:41', 5, 5, 5, 5),
(5, '62bfdc63-b02b-11f1-8133-e4b97a51c3a0', 28, NULL, NULL, 'فرع المدينة المنورة', 5, 'سرعة في الإنجاز وجودة عالية جداً.', 10, '2026-09-12 10:00:00', '2026-09-14 13:59:41', 5, 5, 5, 5),
(6, '714c9fc6-b02d-11f1-8133-e4b97a51c3a0', 28, NULL, NULL, 'فرع جدة', 4, 'الخدمه جيده لكن كان هنا تاخير في تسليم العربيه', 10, '2026-09-14 14:14:24', '2026-09-14 14:14:24', 5, 5, 5, 5),
(7, '6e1e88e2-b206-11f1-8f30-fd92e3be0bfd', 64, 0, 0, 'فرع جدة', 5, NULL, 10, '2026-09-16 19:40:11', '2026-09-16 19:40:11', 5, 5, 5, 5),
(8, 'd7b0fa37-c815-11f1-9981-64ef84c75a6b', 28, NULL, 102, 'فرع جدة', 5, 'جامد', 10, '2026-10-14 21:25:56', '2026-10-14 21:25:56', 4, 4, 5, 5),
(9, '22e8a8f4-c817-11f1-9981-64ef84c75a6b', 28, NULL, 113, 'فرع جدة', 4, NULL, 10, '2026-10-14 21:35:12', '2026-10-14 21:35:12', 4, 5, 4, 3),
(10, '9da2a40e-c840-11f1-9981-64ef84c75a6b', 28, NULL, 103, 'فرع جدة', 4, NULL, 10, '2026-10-15 02:32:07', '2026-10-15 02:32:07', 2, 4, 5, 3);

-- --------------------------------------------------------

--
-- Table structure for table `technician_commissions`
--

CREATE TABLE `technician_commissions` (
  `id` int(11) NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `technician_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `work_order_id` int(11) DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'SAR',
  `vehicle_info` varchar(255) DEFAULT NULL,
  `vehicle_plate` varchar(50) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'confirmed',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `phone` varchar(20) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('client','admin','technician') NOT NULL DEFAULT 'client',
  `member_since` datetime NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `city` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT 0,
  `company` varchar(150) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_super_admin` tinyint(1) DEFAULT 0,
  `branch_name` varchar(100) DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `is_corporate` tinyint(1) DEFAULT 0,
  `role_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `phone`, `full_name`, `email`, `password`, `role`, `member_since`, `is_active`, `created_at`, `updated_at`, `city`, `address`, `notes`, `is_premium`, `company`, `avatar_url`, `is_super_admin`, `branch_name`, `permissions`, `company_id`, `is_corporate`, `role_id`) VALUES
(28, '3875f0fe-9b4c-11f1-871f-e4b97a51c3a0', '+966503157956', 'Ali Ahmed Mohamed', 'alimohamed24355@gmail.com', '$2a$10$yOVnCmCXrAJO7H4BZfVtje78sYQyb/8IXSwUWqwkZh5YANKKzQKtq', 'client', '2026-08-19 00:31:49', 1, '2026-08-19 00:31:49', '2026-09-12 01:51:05', 'Menofia', 'the stadiam', NULL, 0, NULL, '/assets/company/Adira Business Services Company.png', 0, 'فرع مكة المكرمة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 4, 1, NULL),
(30, 'ed2e16e0-9b60-11f1-871f-e4b97a51c3a0', '+966506489321', 'youssef abbas', 'youssefabbas722@gmail.com', '$2a$10$RD47T/Uz.d1/v9clRxtseO3oZaFGKhBMi5qhFNAD9dBhYLVHg..2y', 'admin', '2026-08-19 03:00:02', 1, '2026-08-19 03:00:02', '2026-08-27 20:20:30', NULL, NULL, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, 0, NULL),
(48, '4e37e954-9e17-11f1-8494-e4b97a51c3a0', '+966500000006', 'ali mohamed', 'alimohamed@gmail.com', '$2a$10$BVflO89NOB9lhdK3BWNhd.pAlU69BP9zEFr.cZXUMyAiLCxB/JloW', '', '2026-08-22 13:50:35', 1, '2026-08-22 13:50:35', '2026-09-16 12:02:49', 'Menofia', 'the stadiam', NULL, 0, NULL, NULL, 1, 'فرع جدة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', NULL, 0, NULL),
(50, 'e3ec811d-a716-11f1-9e33-e4b97a51c3a0', '+966503157977', 'Amr Mohamed', 'amrmohamed@gmail.com', '$2a$10$RaN9PNJkMHRG./bzeglB2OB.WalCkrQxALtxrXstsoxfIxY71KyjC', 'client', '2026-09-03 00:40:18', 0, '2026-09-03 00:40:18', '2026-09-12 01:09:42', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', NULL, NULL, 0, NULL),
(51, '192ab6fc-ad78-11f1-8c40-e4b97a51c3a0', '+966500000003', 'samy', 'samy@gmail.com', '$2a$10$MBmQ/VszHD3po0kimd3Fg.d/aLifZoXfc2YADm0zHrFHS9l6BuUQC', 'technician', '2026-09-11 03:31:15', 1, '2026-09-11 03:31:15', '2026-09-11 03:31:15', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, 0, NULL),
(52, '2fa6b1a9-ae21-11f1-ac8d-e4b97a51c3a0', '0501112233', 'خالد عبد الرحمن العتيبي', 'khalid@example.com', '$2a$10$8Ybx6aCwcUz2Yyima4ctiuf0y.TfWwq3k29hg81BdOYGuQBAesZEm', 'client', '2026-09-11 23:41:38', 1, '2026-09-11 23:41:38', '2026-09-12 01:16:05', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع مكة المكرمة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 3, 1, NULL),
(53, '2fa6f8b4-ae21-11f1-ac8d-e4b97a51c3a0', '0504445566', 'سارة محمد الشمري', 'sara@example.com', '$2a$10$8Ybx6aCwcUz2Yyima4ctiuf0y.TfWwq3k29hg81BdOYGuQBAesZEm', '', '2026-09-11 23:41:38', 1, '2026-09-11 23:41:38', '2026-09-16 10:14:02', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', NULL, 0, NULL),
(54, '2fa6fa34-ae21-11f1-ac8d-e4b97a51c3a0', '557778899', 'محمد عبد الله القحطاني', 'm.qahtani@example.com', '$2a$10$nxFqJiN3s2UviIUrpQz55uYNXhZTiInX7hv0ag6nXwQ69oNh8J53a', 'client', '2026-09-11 23:41:38', 1, '2026-09-11 23:41:38', '2026-09-12 01:51:47', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع الرياض - الفيصلية 1', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 3, 1, NULL),
(55, '2fa6faf6-ae21-11f1-ac8d-e4b97a51c3a0', '0569990011', 'فيصل سعيد الغامدي', 'faisal@example.com', '$2a$10$8Ybx6aCwcUz2Yyima4ctiuf0y.TfWwq3k29hg81BdOYGuQBAesZEm', 'client', '2026-09-11 23:41:38', 1, '2026-09-11 23:41:38', '2026-09-11 23:41:38', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', NULL, NULL, 0, NULL),
(57, '6072b72f-af20-11f1-b237-e4b97a51c3a0', '+966555555554', 'mohamed ahmed', 'mohamedahmed@gmail.com', '$2a$10$k6ohNXbJWnhdR3MqL7na5.iF/yW22vNsdx2fAosPyzoYVIYuWGQKu', '', '2026-09-13 06:08:21', 1, '2026-09-13 06:08:21', '2026-09-16 12:28:56', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع الدمام', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 3, 1, 1),
(59, '5f72bacd-af50-11f1-b237-e4b97a51c3a0', '966500000012', 'Ajmal ', NULL, '$2a$10$qSVWYn64b5qmkM/TqnaLJugZkxgZN3yX/ZVx..gTSuCXg/.hXwDFq', 'technician', '2026-09-13 11:51:55', 1, '2026-09-13 11:51:55', '2026-09-13 11:51:55', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', NULL, NULL, 0, NULL),
(60, '8d6927c2-af50-11f1-b237-e4b97a51c3a0', '966500000100', 'kareem yaser', NULL, '$2a$10$hzFOeNyqIXRL8IQ5WuBbw.kc3.s7E.h5AVR1.5cPxMud3sLe38Ryu', '', '2026-09-13 11:53:12', 1, '2026-09-13 11:53:12', '2026-10-06 05:46:02', NULL, NULL, NULL, 0, NULL, NULL, 1, 'فرع الدمام', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false,\"view_overview\":false,\"view_checklists\":false,\"create_checklist\":false,\"delete_checklist\":false,\"view_client_details\":true,\"view_contact_requests\":true,\"view_reviews\":true}', 5, 1, 3),
(61, '2475f2ba-b1c1-11f1-8f30-fd92e3be0bfd', '966510833646', 'Emad El-Deen', NULL, '$2a$10$vF9q8W/EAkzPE.V5mhKo5O9u5ujUGPx9wtyXTCtZ.NztPgnY/QoYK', 'admin', '2026-09-16 11:24:12', 1, '2026-09-16 11:24:12', '2026-09-16 17:28:16', NULL, NULL, NULL, 0, NULL, NULL, 1, 'فرع جدة', '{\"manage_packages\":true,\"manage_coupons\":true,\"manage_companies\":true,\"delete_clients\":true,\"edit_clients\":true,\"view_billing\":true,\"manage_ai\":true,\"manage_permissions\":true,\"view_contact_requests\":true,\"view_reviews\":true,\"view_scheduling\":true,\"view_appointments\":true,\"view_packages\":true,\"view_companies\":true,\"view_employees\":true,\"edit_employee\":true,\"delete_employee\":true,\"create_employee\":true,\"delete_client\":true,\"create_client\":true,\"view_clients\":true,\"view_client_details\":true,\"edit_client\":true,\"create_checklist\":true,\"delete_checklist\":true,\"edit_checklist\":true,\"view_checklists\":true,\"view_overview\":true}', NULL, 0, NULL),
(62, '131dc0ea-b1c2-11f1-8f30-fd92e3be0bfd', '966546754532', 'Abdulhai Barnawi', NULL, '$2a$10$EvS9I6AVpJ1Xp4p.GjYa4.4KGhRb7RXlqBe0JOuuZRYoamsLa5ciK', 'admin', '2026-09-16 11:30:52', 1, '2026-09-16 11:30:52', '2026-09-16 15:34:06', NULL, NULL, NULL, 0, NULL, NULL, 1, 'فرع جدة', NULL, NULL, 0, NULL),
(63, 'dfe03b6f-b1cc-11f1-8f30-fd92e3be0bfd', '966556677889', 'Ahmed Mostafa', NULL, '$2a$10$sSZiuw7iFgVoJi/fUNdzPOrrjLBe7ERP3//MiX4wEGghZM.tAdBau', 'admin', '2026-09-16 12:48:11', 1, '2026-09-16 12:48:11', '2026-09-16 15:34:06', NULL, NULL, NULL, 0, NULL, NULL, 1, 'فرع جدة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', NULL, 0, NULL),
(64, '5e13ad0d-b204-11f1-8f30-fd92e3be0bfd', '966592889744', 'Badr Barnawi', NULL, '$2a$10$VOg9TMlwvz.r.qYVD/NQAeaoH.eM7HFYaPm9c0xA6pVTOu1a30kdu', 'client', '2026-09-16 19:25:25', 1, '2026-09-16 19:25:25', '2026-10-06 12:04:53', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 5, 1, NULL),
(65, 'df204e1a-b220-11f1-8f30-fd92e3be0bfd', '9663456789', 'company test ', NULL, '$2a$10$sB54sOh1p8umkl8/VjRaxeSI3T5YmhvjP9b.bU7G7SCvIWqPV6L0C', 'client', '2026-09-16 22:49:27', 1, '2026-09-16 22:49:27', '2026-10-06 05:37:34', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع الدمام', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', 7, 1, NULL),
(66, 'a0bcec81-b2a0-11f1-8f30-fd92e3be0bfd', '966535920226', 'احمد سليمان نيب ', 'MEDO.S.NEEB@GMAIL.COM', '$2a$10$/1IW/GmPSIAOjuQFI0xDSe3pUHFxqW0A3YsKoq9Xpe8OvbrZREuLG', '', '2026-09-17 14:03:58', 1, '2026-09-17 14:03:58', '2026-09-20 17:57:52', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', '{\"manage_packages\":false,\"manage_coupons\":false,\"manage_companies\":false,\"delete_clients\":false,\"edit_clients\":false,\"view_billing\":false,\"manage_ai\":false}', NULL, 0, 3),
(67, '5ac70f66-b388-11f1-8f30-fd92e3be0bfd', '966666666', 'ali ali ali', NULL, '$2a$10$sqXlglsgyRot575qn2JfYuhF0ROfpOD2b.fzzAKjp4D0ciaVFJQL6', 'client', '2026-09-18 17:42:44', 1, '2026-09-18 17:42:44', '2026-09-18 17:42:44', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', '{}', 5, 1, NULL),
(68, '1e85c6c4-b9b8-11f1-9981-64ef84c75a6b', '966500001324', 'ammar', NULL, '$2a$10$wtdYsGxFw5jMpbnnJkqs/eJGDtYNuWKqPGBul3xN3b4e1cWjqDf9y', '', '2026-09-26 14:39:46', 1, '2026-09-26 14:39:46', '2026-09-26 14:40:13', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع مكة المكرمة', '{}', NULL, 0, 3),
(69, '23bfa940-b9f2-11f1-9981-64ef84c75a6b', '562770587', 'mahmoud ', 'thekilersoul@gmail.com', '$2a$10$B7mihm4X0oVe4nBOCvhqlO7Fw1NbPIt58Bfhu3E3mCMQgaFllS4Km', 'client', '2026-09-26 21:35:05', 1, '2026-09-26 21:35:05', '2026-09-26 21:35:05', NULL, NULL, NULL, 0, NULL, NULL, 0, 'جدة - الصفا', '{}', NULL, 0, NULL),
(71, '6675814d-ba03-11f1-9981-64ef84c75a6b', '+966500000000', 'عميل ريفليكتو المميز', 'client@reflecto.com.sa', '$2a$10$13eTBEy3EdzJlOQjAHHtJe/m6YsUveOFOz3onz9LWqUjkhwTX7b62', 'client', '2026-09-26 23:38:39', 1, '2026-09-26 23:38:39', '2026-09-28 22:16:27', NULL, NULL, NULL, 0, NULL, NULL, 0, 'فرع جدة', NULL, NULL, 0, NULL),
(72, 'ed31f2f6-bcbd-11f1-9981-64ef84c75a6b', '595346772', 'Ahmed Gaber', NULL, '$2a$10$9QoGdki85GxIhWyXPuYkUu0iW/QO1TnFptXCSSEhJJFGAlV4tERRy', 'client', '2026-09-30 10:58:53', 1, '2026-09-30 10:58:53', '2026-09-30 10:58:53', NULL, NULL, NULL, 0, NULL, NULL, 0, 'جدة - شارع صاري', '{}', NULL, 0, NULL),
(73, '4dea2f1f-bcc0-11f1-9981-64ef84c75a6b', '535558104', 'Fadi Bashir', 'fadizanboua@gmail.com', '$2a$10$F2rBN7phEKWVZfNvnjEeyuH16NS3sLhvZKFtkaNMQnzNwOjn8zNnm', 'admin', '2026-09-30 11:15:55', 1, '2026-09-30 11:15:55', '2026-10-01 21:21:55', NULL, NULL, NULL, 0, NULL, NULL, 1, 'جدة - شارع صاري', '{\"view_billing\":true,\"view_checklists\":true,\"view_order_details\":true,\"create_checklist\":true,\"edit_checklist\":true,\"view_quotations\":true,\"create_quotation\":true,\"view_clients\":true,\"view_client_details\":true,\"create_client\":true,\"edit_client\":true,\"view_employees\":true,\"create_employee\":true,\"edit_employee\":true,\"delete_employee\":true,\"view_companies\":true,\"manage_companies\":true,\"view_packages\":true,\"manage_packages\":true,\"view_appointments\":true,\"edit_appointment\":true,\"delete_appointment\":false,\"view_scheduling\":true,\"manage_coupons\":true,\"view_contact_requests\":true,\"view_reviews\":true}', NULL, 0, NULL),
(74, '86070260-bcc5-11f1-9981-64ef84c75a6b', '966562654275', 'أحمد صبري الميت ', NULL, '$2a$10$FBr77.qddMJjdHnEUyL3Peb2fcG5yZnTdYbd0rVCiHRyHq0IgMpj.', '', '2026-09-30 11:53:16', 1, '2026-09-30 11:53:16', '2026-10-08 21:43:53', NULL, NULL, NULL, 0, NULL, NULL, 0, 'جدة - البوادي', '{\"view_overview\":true,\"view_orders\":true,\"view_appointments\":true,\"view_contact_requests\":true,\"view_clients\":true,\"view_client_details\":true,\"view_employees\":true,\"view_companies\":true,\"view_packages\":false,\"view_coupons\":true,\"view_reviews\":true,\"view_billing\":false,\"view_checklists\":true,\"create_client\":true,\"edit_client\":true,\"delete_client\":false,\"create_order\":false,\"edit_order\":false,\"manage_companies\":false,\"manage_packages\":false,\"manage_coupons\":true,\"manage_ai\":false,\"create_checklist\":true,\"edit_checklist\":true,\"manage_permissions\":false,\"edit_appointment\":true,\"view_scheduling\":true,\"view_quotations\":true,\"create_quotation\":true,\"view_order_details\":true,\"edit_quotation\":true,\"create_employee\":false}', NULL, 0, 1),
(75, 'fb542547-c3fc-11f1-9981-64ef84c75a6b', '592185500', 'Mohamed ebrahim Elshora', 'emad.me2099@gmail.com', '$2a$10$ne0qvCvQv2Vhaen.rHheGOviANaLtQULIZw1U0OQBwqSr526Y7jpi', 'client', '2026-10-09 16:17:54', 1, '2026-10-09 16:17:54', '2026-10-09 16:17:54', NULL, NULL, NULL, 0, NULL, NULL, 0, 'جدة - الصفا', '{}', NULL, 0, NULL),
(76, '3aa9cd1c-c634-11f1-9981-64ef84c75a6b', '566545404', 'فهد القرني ', NULL, '$2a$10$5eb1baVkOVGx0GrA.wlfN.gddKAUV1saG5CM9A7AtzyzL9oVXqKiK', 'client', '2026-10-12 11:58:24', 1, '2026-10-12 11:58:24', '2026-10-12 11:58:24', NULL, NULL, NULL, 0, NULL, NULL, 0, 'جدة - شارع صاري', '{}', 6, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `client_id` int(10) UNSIGNED NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` year(4) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `plate` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `chassis_number` varchar(100) DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `uuid`, `client_id`, `brand`, `model`, `year`, `color`, `plate`, `created_at`, `chassis_number`, `mileage`) VALUES
(26, 'cd2d6010-9e15-11f1-8494-e4b97a51c3a0', 30, 'Toyota', 'X5', '2020', 'Black', 'A1', '2026-08-22 13:39:49', NULL, NULL),
(28, '4e3af1b8-9e17-11f1-8494-e4b97a51c3a0', 48, 'BMW', 'X5', '2019', 'Black', 'A1', '2026-08-22 13:50:35', NULL, NULL),
(35, '3f8e0419-9eac-11f1-b96c-e4b97a51c3a0', 30, 'Toyota', 'Subra', '2025', NULL, NULL, '2026-08-23 07:36:46', NULL, NULL),
(45, '0f9140f9-a2c9-11f1-92b2-e4b97a51c3a0', 48, 'BMW', 'G5', '2026', 'black', NULL, '2026-08-28 13:13:05', NULL, NULL),
(46, '411b0381-a2ca-11f1-92b2-e4b97a51c3a0', 48, 'BMW', 'SX', '2026', 'black', NULL, '2026-08-28 13:21:38', NULL, NULL),
(47, '908144f5-a5b8-11f1-99f9-e4b97a51c3a0', 30, 'BMW', 'G4', '2025', NULL, NULL, '2026-09-01 06:52:34', NULL, NULL),
(48, '11300202-a70f-11f1-9e33-e4b97a51c3a0', 28, 'HYUNDAI', 'ELANTRA', '2022', 'black', 'ي ب س 865', '2026-09-02 23:44:17', 'vf2d50454', NULL),
(50, 'f58102db-a71b-11f1-9e33-e4b97a51c3a0', 28, 'BMW', 'SX', '2025', 'gray', '213 أ ي  ن', '2026-09-03 01:16:35', 'vf2d50454', NULL),
(51, '607401b0-af20-11f1-b237-e4b97a51c3a0', 57, 'Dodje', 'SRT', '2024', NULL, 'ات م123', '2026-09-13 06:08:21', NULL, NULL),
(52, '60745145-af20-11f1-b237-e4b97a51c3a0', 57, 'Dodje', 'SRT', '2024', NULL, 'ي ب س 865', '2026-09-13 06:08:21', NULL, NULL),
(53, '8d697b9d-af50-11f1-b237-e4b97a51c3a0', 60, 'Dodje', 'SRT', '2024', 'black', 'ي ب س 865', '2026-09-13 11:53:12', 'vf2d50454', NULL),
(54, '8d69dba1-af50-11f1-b237-e4b97a51c3a0', 60, 'Dodje', 'SRT', '2024', NULL, 'ي ب س 865', '2026-09-13 11:53:12', NULL, NULL),
(55, '5e13ee1b-b204-11f1-8f30-fd92e3be0bfd', 64, 'changan', 'uni k', '2026', 'رصاصي ', 'ب ب ب ٦٦٦', '2026-09-16 19:25:25', NULL, NULL),
(56, '5ac74f1a-b388-11f1-8f30-fd92e3be0bfd', 67, 'Hyundai ', ' Elantra', '2026', 'رصاصي ', 'ب ب ب ٦٦٦', '2026-09-18 17:42:44', NULL, NULL),
(57, '23bfe8b7-b9f2-11f1-9981-64ef84c75a6b', 69, 'kia', 'cerato', '2026', 'رصاصي', 'س ي ص 2231', '2026-09-26 21:35:05', NULL, NULL),
(60, 'de3a31c5-ba01-11f1-9981-64ef84c75a6b', 52, 'BMW', 'M3', '2025', 'Blue', 'ي ب س 865', '2026-09-26 23:27:41', NULL, NULL),
(61, 'ed3220d8-bcbd-11f1-9981-64ef84c75a6b', 72, 'Hyundai ', ' Elantra', '2026', 'ابيض ', NULL, '2026-09-30 10:58:53', NULL, NULL),
(62, 'f365599f-bfe5-11f1-9981-64ef84c75a6b', 63, 'bmw', 'e46', '2001', NULL, NULL, '2026-10-04 11:22:57', NULL, NULL),
(63, '4d647508-c147-11f1-9981-64ef84c75a6b', 60, 'Dodje', 'SRT', '2024', NULL, 'ي ب س 865', '2026-10-06 05:32:21', NULL, NULL),
(64, '4d648b48-c147-11f1-9981-64ef84c75a6b', 60, 'Dodje', 'SRT', '2024', 'black', 'ي ب س 865', '2026-10-06 05:32:21', 'vf2d50454', NULL),
(65, 'fb546095-c3fc-11f1-9981-64ef84c75a6b', 75, 'MG', 'Whale', '2025', 'ابيض', 'س س س ٣٣٣', '2026-10-09 16:17:54', NULL, NULL),
(66, '3aaa485e-c634-11f1-9981-64ef84c75a6b', 76, 'شانجان ', 'Cs95', '2026', 'اسود', NULL, '2026-10-12 11:58:25', NULL, NULL),
(67, 'e9f5ad06-c67f-11f1-9981-64ef84c75a6b', 61, 'Porsche', '911 GT3 RS', '2024', NULL, NULL, '2026-10-12 21:00:11', NULL, NULL),
(68, '42e7a238-c817-11f1-9981-64ef84c75a6b', 28, 'BMW', 'SX', '2025', 'gray', '213 أ ي  ن', '2026-10-14 21:36:05', 'vf2d50454', NULL),
(69, '42e7bbca-c817-11f1-9981-64ef84c75a6b', 28, 'toyota', 'G5', '2025', 'black', NULL, '2026-10-14 21:36:05', NULL, NULL),
(70, '42e7c69d-c817-11f1-9981-64ef84c75a6b', 28, 'toyota', 'SX', '2024', 'blue', NULL, '2026-10-14 21:36:05', NULL, NULL),
(71, '42e7d121-c817-11f1-9981-64ef84c75a6b', 28, 'Dodje challenger', 'SRT', '2020', 'black', NULL, '2026-10-14 21:36:05', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warranties`
--

CREATE TABLE `warranties` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `appointment_id` int(11) DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `vehicle_id` int(10) UNSIGNED NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `start_date` date NOT NULL,
  `coverage_years` tinyint(3) UNSIGNED NOT NULL,
  `expiry_date` date NOT NULL,
  `certificate_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `vehicle_name` varchar(150) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'years',
  `coverage_months` int(11) DEFAULT 0,
  `work_order_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_model` varchar(255) DEFAULT NULL,
  `coverage_area` varchar(255) DEFAULT NULL,
  `service_details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warranties`
--

INSERT INTO `warranties` (`id`, `uuid`, `appointment_id`, `client_id`, `vehicle_id`, `service_name`, `start_date`, `coverage_years`, `expiry_date`, `certificate_url`, `is_active`, `created_at`, `vehicle_name`, `unit`, `coverage_months`, `work_order_id`, `product_name`, `product_model`, `coverage_area`, `service_details`) VALUES
(94, '7bac2f67-ad7c-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'عازل حراري (Heat Insulation)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 04:02:38', 'BMW SX 213 أ ي  ن', 'years', 12, 41, NULL, NULL, NULL, NULL),
(95, '7bac7395-ad7c-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'تلميع خارجي (External Polishing)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 04:02:38', 'BMW SX 213 أ ي  ن', 'years', 12, 41, NULL, NULL, NULL, NULL),
(96, '7bacfcc9-ad7c-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'نانو سيراميك (Nano Ceramic)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 04:02:38', 'BMW SX 213 أ ي  ن', 'years', 12, 41, NULL, NULL, NULL, NULL),
(97, '7bad3fe0-ad7c-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'حماية الطلاء PPF (Paint Protection Film)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 04:02:38', 'BMW SX 213 أ ي  ن', 'years', 12, 41, NULL, NULL, NULL, NULL),
(98, '5b33e16c-ad9d-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'عازل حراري (Heat Insulation)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 07:57:57', 'BMW SX 213 أ ي  ن', 'years', 12, 42, NULL, NULL, NULL, NULL),
(99, '5b353c58-ad9d-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'تلميع خارجي (External Polishing)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 07:57:57', 'BMW SX 213 أ ي  ن', 'years', 12, 42, NULL, NULL, NULL, NULL),
(100, '5b35c6c7-ad9d-11f1-8c40-e4b97a51c3a0', NULL, 28, 50, 'نانو سيراميك (Nano Ceramic)', '2026-09-11', 1, '2027-09-11', NULL, 1, '2026-09-11 07:57:57', 'BMW SX 213 أ ي  ن', 'years', 12, 42, NULL, NULL, NULL, NULL),
(107, '7a731de2-af57-11f1-b237-e4b97a51c3a0', NULL, 60, 54, 'عازل حراري (Heat Insulation)', '2026-09-13', 9, '2035-09-13', NULL, 1, '2026-09-13 12:42:47', 'Dodje SRT ي ب س 865', 'years', 108, 45, NULL, NULL, NULL, NULL),
(108, '7a7351b1-af57-11f1-b237-e4b97a51c3a0', NULL, 60, 54, 'تلميع خارجي (External Polishing)', '2026-09-13', 0, '2027-08-13', NULL, 1, '2026-09-13 12:42:47', 'Dodje SRT ي ب س 865', 'months', 11, 45, NULL, NULL, NULL, NULL),
(109, '7a73e4c0-af57-11f1-b237-e4b97a51c3a0', NULL, 60, 54, 'نانو سيراميك (Nano Ceramic)', '2026-09-13', 8, '2034-09-13', NULL, 1, '2026-09-13 12:42:47', 'Dodje SRT ي ب س 865', 'years', 96, 45, NULL, NULL, NULL, NULL),
(110, '9439a363-af62-11f1-b237-e4b97a51c3a0', NULL, 60, 54, 'عازل حراري (Heat Insulation)', '2026-09-13', 1, '2027-09-13', NULL, 1, '2026-09-13 14:02:15', 'Dodje SRT ي ب س 865', 'years', 12, 46, NULL, NULL, NULL, NULL),
(111, '943a83c5-af62-11f1-b237-e4b97a51c3a0', NULL, 60, 54, 'نانو سيراميك (Nano Ceramic)', '2026-09-13', 1, '2027-09-13', NULL, 1, '2026-09-13 14:02:15', 'Dodje SRT ي ب س 865', 'years', 12, 46, NULL, NULL, NULL, NULL),
(112, 'f92234f0-b204-11f1-8f30-fd92e3be0bfd', NULL, 64, 55, 'عازل حراري (Heat Insulation)', '2026-09-16', 5, '2031-09-16', NULL, 1, '2026-09-16 19:29:45', 'changan uni k ب ب ب ٦٦٦', 'years', 60, 47, NULL, NULL, NULL, NULL),
(114, 'f922b4f4-b204-11f1-8f30-fd92e3be0bfd', NULL, 64, 55, 'نانو سيراميك (Nano Ceramic)', '2026-09-16', 0, '2027-03-16', NULL, 1, '2026-09-16 19:29:45', 'changan uni k ب ب ب ٦٦٦', 'months', 6, 47, NULL, NULL, NULL, NULL),
(115, 'f922ca5c-b204-11f1-8f30-fd92e3be0bfd', NULL, 64, 55, 'حماية الطلاء PPF (Paint Protection Film)', '2026-09-16', 5, '2031-09-16', NULL, 1, '2026-09-16 19:29:45', 'changan uni k ب ب ب ٦٦٦', 'years', 60, 47, NULL, NULL, NULL, NULL),
(117, '789d7ba6-b9f4-11f1-9981-64ef84c75a6b', 109, 69, 57, 'حماية الطلاء PPF (Paint Protection Film)', '2026-09-26', 1, '2027-09-26', NULL, 1, '2026-09-26 21:51:47', NULL, 'years', 0, NULL, NULL, NULL, NULL, NULL),
(118, 'c31e3610-ba04-11f1-9981-64ef84c75a6b', 110, 52, 60, 'حماية الطلاء PPF (Paint Protection Film)', '2027-02-20', 1, '2028-02-20', NULL, 1, '2026-09-26 23:48:24', NULL, 'years', 0, NULL, NULL, NULL, NULL, NULL),
(119, '75c356f7-c816-11f1-9981-64ef84c75a6b', NULL, 28, 50, 'عازل حراري (Heat Insulation)', '2026-10-14', 2, '2028-10-14', NULL, 1, '2026-10-14 21:30:21', 'HYUNDAI ELANTRA ي ب س 865', 'years', 24, 51, 'Apex', 'Nano thiramic', 'معظم السياره', NULL),
(120, '75c384bb-c816-11f1-9981-64ef84c75a6b', NULL, 28, 50, 'تلميع خارجي (External Polishing)', '2026-10-14', 0, '2027-01-14', NULL, 1, '2026-10-14 21:30:21', 'HYUNDAI ELANTRA ي ب س 865', 'months', 3, 51, 'Reflecto', 'Multi', 'هيكل خارجي', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `work_orders`
--

CREATE TABLE `work_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `work_order_number` varchar(50) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `client_phone` varchar(50) NOT NULL,
  `order_date` date DEFAULT NULL,
  `heat_insulation` text DEFAULT NULL,
  `polishing` text DEFAULT NULL,
  `nano_ceramic` text DEFAULT NULL,
  `ppf` text DEFAULT NULL,
  `removal_services` text DEFAULT NULL,
  `client_type` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `vat_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `remaining_amount` decimal(10,2) DEFAULT 0.00,
  `vehicle_type` varchar(100) DEFAULT NULL,
  `vehicle_model` varchar(100) DEFAULT NULL,
  `vehicle_year` varchar(50) DEFAULT NULL,
  `vehicle_color` varchar(50) DEFAULT NULL,
  `vehicle_plate` varchar(50) DEFAULT NULL,
  `chassis_number` varchar(100) DEFAULT NULL,
  `mileage_km` varchar(50) DEFAULT NULL,
  `inspection_notes` text DEFAULT NULL,
  `inspection_checklist` text DEFAULT NULL,
  `reception_name` varchar(100) DEFAULT NULL,
  `accountant_name` varchar(100) DEFAULT NULL,
  `sales_manager_name` varchar(100) DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `received_by_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','delivered') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ppf_partial_details` varchar(255) DEFAULT NULL,
  `has_warranty` tinyint(1) DEFAULT 0,
  `warranty_years` int(11) DEFAULT 0,
  `warranty_start_date` date DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT 'فرع جدة',
  `heat_insulation_details` varchar(255) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `partial_payments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`partial_payments`)),
  `technician_id` int(11) DEFAULT NULL,
  `technician_name` varchar(150) DEFAULT NULL,
  `service_progress` text DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `service_warranties` text DEFAULT NULL,
  `service_technicians` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`service_technicians`)),
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `company_name` varchar(150) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_model` varchar(255) DEFAULT NULL,
  `coverage_area` varchar(255) DEFAULT NULL,
  `service_details` text DEFAULT NULL,
  `technician_commission` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_orders`
--

INSERT INTO `work_orders` (`id`, `uuid`, `work_order_number`, `client_name`, `client_phone`, `order_date`, `heat_insulation`, `polishing`, `nano_ceramic`, `ppf`, `removal_services`, `client_type`, `price`, `vat_amount`, `total_amount`, `paid_amount`, `remaining_amount`, `vehicle_type`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `vehicle_plate`, `chassis_number`, `mileage_km`, `inspection_notes`, `inspection_checklist`, `reception_name`, `accountant_name`, `sales_manager_name`, `delivery_date`, `received_by_name`, `status`, `created_at`, `updated_at`, `ppf_partial_details`, `has_warranty`, `warranty_years`, `warranty_start_date`, `warranty_end_date`, `branch_name`, `heat_insulation_details`, `payment_method`, `partial_payments`, `technician_id`, `technician_name`, `service_progress`, `started_at`, `completed_at`, `service_warranties`, `service_technicians`, `original_price`, `discount_percent`, `discount_amount`, `company_name`, `product_name`, `product_model`, `coverage_area`, `service_details`, `technician_commission`) VALUES
(41, '7baa0471-ad7c-11f1-8c40-e4b97a51c3a0', 'WO-260000', 'Ali Ahmed Mohamed', '+966503157956', '2026-09-11', '[\"امامي\"]', '[\"خارجي\"]', '[\"داخلي\"]', '[\"أطراف الأبواب + تحت المقابض\"]', '[]', 'عميل سابق', 2173.91, 326.09, 2500.00, 2500.00, 0.00, 'BMW', 'SX', '2025', 'gray', '213 أ ي  ن', 'vf2d50454', '48000', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":true,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false,\"sunroof\":true,\"rear_window\":true,\"windshield\":true,\"hood\":true,\"front_fender_left\":true}', 'امجد', 'محمود', 'عمار', '2027-02-20 17:00:00', NULL, 'completed', '2026-09-11 04:02:38', '2026-09-11 07:57:57', NULL, 1, 0, NULL, NULL, 'فرع جدة', '{\"امامي\":\"03\"}', 'مدى (Mada)', NULL, 51, 'samy', '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-11T01:03:58.219Z\",\"completed_at\":\"2026-09-11T01:50:03.512Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-09-11T01:04:28.404Z\",\"completed_at\":\"2026-09-11T01:04:28.404Z\"},\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-11T01:04:29.685Z\",\"completed_at\":\"2026-09-11T01:04:29.685Z\"},\"ppf\":{\"completed\":true,\"started_at\":\"2026-09-11T01:07:19.136Z\",\"completed_at\":\"2026-09-11T01:07:19.136Z\"}}', '2026-09-11 04:03:42', '2026-09-11 04:50:20', NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 0.00),
(42, '60d07ad8-ad83-11f1-8c40-e4b97a51c3a0', 'WO-260001', 'Ali Ahmed Mohamed', '+966503157956', '2026-09-11', '[\"امامي\"]', '[\"خارجي\"]', '[\"داخلي\"]', '[]', '[]', 'عميل سابق', 1565.22, 234.78, 1800.00, 1800.00, 0.00, 'BMW', 'SX', '2025', 'gray', '213 أ ي  ن', 'vf2d50454', '48000', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false,\"trunk\":true,\"sunroof\":true,\"windshield\":true,\"hood\":true,\"rear_window\":true}', 'امجد', 'محمود', 'عمار', '2027-02-20 17:00:00', NULL, 'completed', '2026-09-11 04:52:00', '2026-09-11 07:57:57', NULL, 1, 0, NULL, NULL, 'فرع جدة', '{\"امامي\":\"02\"}', 'مدى (Mada)', NULL, 51, 'samy', '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-11T01:53:13.069Z\",\"completed_at\":\"2026-09-11T02:15:12.588Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-09-11T01:53:14.479Z\",\"completed_at\":\"2026-09-11T02:15:19.386Z\"},\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-11T01:54:30.589Z\",\"completed_at\":\"2026-09-11T02:15:27.033Z\"}}', '2026-09-11 04:52:56', '2026-09-11 05:17:52', NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 0.00),
(45, '7a71070b-af57-11f1-b237-e4b97a51c3a0', 'WO-260002', 'kareem yaser', '966500000100', '2026-09-13', '[\"سائق وركاب\",\"امامي\",\"خلف السائق\"]', '[\"خارجي\",\"داخلي\"]', '[\"داخلي\",\"طبلون + أبواب\"]', '[]', '[]', 'عميل سابق', 1968.00, 295.20, 2263.20, 2263.20, 0.00, 'Dodje', 'SRT', '2024', 'black', 'ي ب س 865', 'vf2d50454', '48000', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'امجد', 'محمود', 'عمار', '2027-02-10 17:00:00', NULL, 'completed', '2026-09-13 12:42:47', '2026-09-13 12:45:08', NULL, 1, 0, NULL, NULL, 'فرع الدمام', '{\"سائق وركاب\":\"02\",\"امامي\":\"01\",\"خلف السائق\":\"04\"}', 'مدى (Mada)', NULL, NULL, NULL, '{\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-13T09:43:28.277Z\",\"completed_at\":\"2026-09-13T09:43:28.277Z\"},\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-13T09:43:43.085Z\",\"completed_at\":\"2026-09-13T09:44:38.229Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-09-13T09:43:48.049Z\",\"completed_at\":\"2026-09-13T09:44:38.229Z\"}}', '2026-09-13 12:43:20', '2026-09-13 12:45:08', '{\"heat_insulation\":{\"duration\":\"9\",\"unit\":\"years\"},\"polishing\":{\"duration\":\"11\",\"unit\":\"months\"},\"nano_ceramic\":{\"duration\":\"8\",\"unit\":\"years\"}}', '{\"heat_insulation\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"polishing\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"nano_ceramic\":\"192ab6fc-ad78-11f1-8c40-e4b97a51c3a0\"}', NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 0.00),
(46, '94326212-af62-11f1-b237-e4b97a51c3a0', 'WO-260003', 'kareem yaser', '966500000100', '2026-09-13', '[\"امامي\"]', '[]', '[\"داخلي\"]', '[]', '[]', 'عميل مباشر', 1230.00, 184.50, 1414.50, 1414.50, 0.00, 'Dodje', 'SRT', '2024', 'black', 'ي ب س 865', '', '', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'امجد', 'محمود', 'عمار', '2026-09-30 18:02:00', NULL, 'completed', '2026-09-13 14:02:15', '2026-09-26 23:25:23', NULL, 0, 0, NULL, NULL, 'فرع الدمام', '{\"امامي\":\"02\"}', 'مدى (Mada)', NULL, NULL, NULL, '{\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-26T23:24:34.669Z\",\"completed_at\":\"2026-09-26T23:24:50.018Z\"}}', '2026-09-26 23:24:34', '2026-09-26 23:25:23', NULL, '{\"heat_insulation\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"nano_ceramic\":\"192ab6fc-ad78-11f1-8c40-e4b97a51c3a0\"}', 1500.00, 18.00, 270.00, 'Scort Team Company', NULL, NULL, NULL, NULL, 0.00),
(47, 'f920f206-b204-11f1-8f30-fd92e3be0bfd', 'WO-260004', 'Badr Barnawi', '966592889744', '2026-09-16', '[\"امامي\",\"سائق وركاب\",\"خلف السائق\",\"مثلث\",\"خلفي شنطه\"]', '[\"خارجي\",\"داخلي\"]', '[\"داخلي\",\"طبلون + أبواب\",\"جنوط\",\"خارجي (طبقة واحدة)\"]', '[\"شمعات\",\"أطراف الأبواب + تحت المقابض\",\"مرايا\"]', '[]', 'عميل مباشر', 1580.00, 237.00, 1817.00, 1000.00, 817.00, 'changan', 'uni k', '2026', 'رصاصي ', 'ب ب ب ٦٦٦', '', '', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'عصمت كردي ', 'محمود', 'عامر زنبوعة ', '2026-09-20 17:00:00', NULL, 'completed', '2026-09-16 19:29:45', '2026-10-09 13:48:51', NULL, 1, 0, NULL, NULL, 'فرع جدة', '{\"امامي\":\"00\",\"سائق وركاب\":\"01\",\"خلف السائق\":\"02\",\"مثلث\":\"03\",\"خلفي شنطه\":\"04\"}', 'مدى (Mada)', NULL, NULL, NULL, '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-16T19:31:31.634Z\",\"completed_at\":\"2026-10-09T13:48:51.335Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-09-16T19:31:33.721Z\",\"completed_at\":\"2026-09-16T19:34:09.620Z\"},\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-16T19:34:04.246Z\",\"completed_at\":\"2026-09-16T19:34:09.620Z\"},\"ppf\":{\"completed\":true,\"started_at\":\"2026-09-16T19:34:05.326Z\",\"completed_at\":\"2026-09-16T19:34:09.620Z\"}}', '2026-09-16 19:31:31', '2026-09-16 19:35:07', '{\"heat_insulation\":{\"duration\":\"5\",\"unit\":\"years\"},\"nano_ceramic\":{\"duration\":\"6\",\"unit\":\"months\"},\"ppf\":{\"duration\":\"5\",\"unit\":\"years\"}}', '{\"heat_insulation\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"polishing\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"nano_ceramic\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"ppf\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\"}', 2000.00, 21.00, 420.00, 'Adira Business Services Company', NULL, NULL, NULL, NULL, 0.00),
(49, '277c51ee-b9f3-11f1-9981-64ef84c75a6b', 'WO-260006', 'mahmoud ', '562770587', '2026-09-26', '[\"امامي\",\"سائق وركاب\",\"خلف السائق\",\"مثلث\",\"خلفي شنطه\",\"بنوراما\"]', '[\"خارجي\",\"داخلي\"]', '[\"داخلي\",\"طبلون + أبواب\",\"جنوط\"]', '[\"شمعات\",\"أطراف الأبواب + تحت المقابض\",\"مرايا\"]', '[]', 'عميل وكالة سيارات', 5000.00, 750.00, 5750.00, 5750.00, 0.00, 'kia', 'cerato', '2026', 'رصاصي', 'س ي ص 2231', '', '', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'عصمت كردي ', 'محمود', 'عامر زنبوعة ', '2026-09-27 17:00:00', NULL, 'completed', '2026-09-26 21:42:21', '2026-09-29 08:08:20', NULL, 0, 0, NULL, NULL, 'جدة - الصفا', '{\"امامي\":\"01\",\"سائق وركاب\":\"02\",\"خلف السائق\":\"01\",\"مثلث\":\"03\",\"خلفي شنطه\":\"01\",\"بنوراما\":\"02\"}', 'مدى (Mada)', '[{\"amount\":1000,\"payment_method\":\"مدى (Mada)\",\"paid_at\":\"2026-09-26T00:00:00.000Z\"},{\"amount\":4750,\"payment_method\":\"مدى / بطاقة بنكية (Mada)\",\"paid_at\":\"2026-09-26T21:43:40.035Z\"}]', NULL, NULL, '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-26T21:45:45.409Z\",\"completed_at\":\"2026-09-26T21:45:45.409Z\"},\"polishing\":{\"completed\":false,\"started_at\":\"2026-09-26T21:47:53.811Z\",\"completed_at\":null},\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-26T21:48:50.110Z\",\"completed_at\":\"2026-09-26T21:48:50.110Z\"},\"ppf\":{\"completed\":true,\"started_at\":\"2026-09-26T21:49:05.799Z\",\"completed_at\":\"2026-09-26T21:49:05.799Z\"}}', '2026-09-26 21:45:45', '2026-09-26 21:51:47', NULL, '{\"heat_insulation\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"polishing\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"nano_ceramic\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\",\"ppf\":\"5f72bacd-af50-11f1-b237-e4b97a51c3a0\"}', NULL, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 0.00),
(50, '5376d685-ba02-11f1-9981-64ef84c75a6b', 'WO-260007', 'خالد عبد الرحمن العتيبي', '0501112233', '2026-09-26', '[\"امامي\",\"سائق وركاب\",\"خلف السائق\",\"مثلث\"]', '[\"خارجي\",\"داخلي\"]', '[\"داخلي\",\"طبلون + أبواب\",\"جنوط\"]', '[\"شمعات\",\"أطراف الأبواب + تحت المقابض\"]', '[]', 'عميل سابق', 2777.00, 416.55, 3193.55, 3193.55, 0.00, 'BMW', 'M3', '2025', 'Blue', 'ي ب س 865', '', '', 'هلا يا ابو فارس هاي الملاحظات ', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'امجد', 'محمود', 'عمار', '2027-02-10 18:02:00', NULL, 'completed', '2026-09-26 23:30:57', '2026-10-09 13:48:42', '', 1, 10, '2026-09-26', '2036-09-26', 'فرع مكة المكرمة', '{\"امامي\":\"00\",\"سائق وركاب\":\"01\",\"خلف السائق\":\"02\",\"مثلث\":\"03\"}', 'تحويل بنكي (Bank Transfer)', '[{\"amount\":2700.55,\"payment_method\":\"تحويل بنكي (Bank Transfer)\",\"paid_at\":\"2026-09-26T00:00:00.000Z\"},{\"amount\":493,\"payment_method\":\"مدى / بطاقة بنكية (Mada)\",\"paid_at\":\"2026-09-26T23:38:39.185Z\"}]', NULL, NULL, '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-09-26T23:42:35.696Z\",\"completed_at\":\"2026-09-30T23:06:49.558Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-09-26T23:43:39.878Z\",\"completed_at\":\"2026-09-26T23:43:39.878Z\"},\"ppf\":{\"completed\":true,\"started_at\":\"2026-09-26T23:45:07.684Z\",\"completed_at\":\"2026-09-26T23:45:07.684Z\"},\"nano_ceramic\":{\"completed\":true,\"started_at\":\"2026-09-26T23:46:05.783Z\",\"completed_at\":\"2026-10-09T13:48:42.228Z\"}}', '2026-09-26 23:41:20', '2026-09-26 23:47:57', NULL, '{\"heat_insulation\":\"samy\",\"polishing\":\"samy\",\"nano_ceramic\":\"Ajmal \",\"ppf\":\"samy\"}', 2700.00, 21.00, 567.00, 'شركة اديرة لخدمات الأعمال', '', '', '', '{}', 0.00),
(51, '75c17826-c816-11f1-9981-64ef84c75a6b', 'WO-260008', 'Ali Ahmed Mohamed', '+966503157956', '2026-10-14', '[\"امامي\",\"سائق وركاب\",\"مثلث\",\"خلف السائق\"]', '[\"داخلي\",\"خارجي\",\"مقاعد\"]', '[]', '[]', '[]', 'عميل سابق', 1148.00, 172.20, 1320.20, 1320.20, 0.00, 'HYUNDAI', 'ELANTRA', '2022', 'black', 'ي ب س 865', 'vf2d50454', '50000', '', '{\"driver_side\":false,\"passenger_side\":false,\"front_bumper\":false,\"back_bumper\":false,\"interior_check\":false,\"inside_check\":false,\"outside_check\":false}', 'امجد', 'محمود', 'عمار', '2027-01-20 17:00:00', NULL, 'completed', '2026-10-14 21:30:21', '2026-10-14 21:32:34', NULL, 1, 0, NULL, NULL, 'فرع مكة المكرمة', '{\"امامي\":\"02\",\"سائق وركاب\":\"03\",\"مثلث\":\"00\",\"خلف السائق\":\"01\"}', 'مدى (Mada)', NULL, NULL, NULL, '{\"heat_insulation\":{\"completed\":true,\"started_at\":\"2026-10-14T21:31:48.603Z\",\"completed_at\":\"2026-10-14T21:31:55.992Z\"},\"polishing\":{\"completed\":true,\"started_at\":\"2026-10-14T21:31:50.863Z\",\"completed_at\":\"2026-10-14T21:31:55.992Z\"}}', '2026-10-14 21:31:48', '2026-10-14 21:32:34', '{\"heat_insulation\":{\"duration\":\"2\",\"unit\":\"years\"},\"polishing\":{\"duration\":\"3\",\"unit\":\"months\"}}', '{\"heat_insulation\":\"192ab6fc-ad78-11f1-8c40-e4b97a51c3a0\",\"polishing\":\"192ab6fc-ad78-11f1-8c40-e4b97a51c3a0\"}', 1400.00, 18.00, 252.00, 'Escort team Company', 'Apex', 'Nano thiramic', 'معظم السياره', '{\"heat_insulation\":{\"product\":\"Apex\",\"product_model\":\"Nano thiramic\",\"coverage_area\":\"معظم السياره\"},\"polishing\":{\"product\":\"Reflecto\",\"product_model\":\"Multi\",\"coverage_area\":\"هيكل خارجي\"}}', 0.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actor_id` (`actor_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `ai_settings`
--
ALTER TABLE `ai_settings`
  ADD PRIMARY KEY (`key_name`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `pricing_tier_id` (`pricing_tier_id`),
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `technician_id` (`technician_id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date` (`preferred_date`),
  ADD KEY `idx_bay_date` (`bay_number`,`preferred_date`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `company_package_prices`
--
ALTER TABLE `company_package_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_tier_unique` (`company_id`,`pricing_tier_id`),
  ADD KEY `pricing_tier_id` (`pricing_tier_id`);

--
-- Indexes for table `contact_requests`
--
ALTER TABLE `contact_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_phone` (`phone`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD UNIQUE KEY `uq_code` (`code`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_client` (`client_id`);

--
-- Indexes for table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `idx_to_user` (`to_user_id`),
  ADD KEY `idx_from_user` (`from_user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_method` (`payment_method`),
  ADD KEY `fk_payments_appointment` (`appointment_id`);

--
-- Indexes for table `pricing_tiers`
--
ALTER TABLE `pricing_tiers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD UNIQUE KEY `uq_slug` (`slug`),
  ADD KEY `idx_sort` (`sort_order`),
  ADD KEY `fk_pricing_tiers_service` (`service_id`),
  ADD KEY `fk_pricing_client` (`client_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD UNIQUE KEY `uq_slug` (`slug`);

--
-- Indexes for table `service_reviews`
--
ALTER TABLE `service_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_branch` (`branch_name`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_appointment` (`appointment_id`);

--
-- Indexes for table `technician_commissions`
--
ALTER TABLE `technician_commissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_tech_id` (`technician_id`),
  ADD KEY `idx_appt_id` (`appointment_id`),
  ADD KEY `idx_wo_id` (`work_order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD UNIQUE KEY `uq_phone` (`phone`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_phone` (`phone`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD KEY `idx_client` (`client_id`);

--
-- Indexes for table `warranties`
--
ALTER TABLE `warranties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_uuid` (`uuid`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_appointment_id` (`appointment_id`);

--
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `company_package_prices`
--
ALTER TABLE `company_package_prices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `contact_requests`
--
ALTER TABLE `contact_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT for table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `pricing_tiers`
--
ALTER TABLE `pricing_tiers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_reviews`
--
ALTER TABLE `service_reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `technician_commissions`
--
ALTER TABLE `technician_commissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `warranties`
--
ALTER TABLE `warranties`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  ADD CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`pricing_tier_id`) REFERENCES `pricing_tiers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_5` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_6` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `company_package_prices`
--
ALTER TABLE `company_package_prices`
  ADD CONSTRAINT `company_package_prices_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_package_prices_ibfk_2` FOREIGN KEY (`pricing_tier_id`) REFERENCES `pricing_tiers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD CONSTRAINT `loyalty_points_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `loyalty_transactions_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loyalty_transactions_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loyalty_transactions_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pricing_tiers`
--
ALTER TABLE `pricing_tiers`
  ADD CONSTRAINT `fk_pricing_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pricing_tiers_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warranties`
--
ALTER TABLE `warranties`
  ADD CONSTRAINT `warranties_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `warranties_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
