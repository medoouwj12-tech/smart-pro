# واجهة API

جميع المسارات تتطلب Cookie الجلسة `sg_session` بعد تسجيل الدخول، باستثناء `POST /api/auth/login`. كل استعلام بيانات مقيّد بمعرّف المؤسسة المأخوذ من الجلسة.

## المصادقة

- `POST /api/auth/login` — `{ "organizationSlug": "…", "email": "…", "password": "…" }`
- `POST /api/auth/logout`

## بيانات المؤسسة

المسار `GET|POST|PATCH|DELETE /api/data/{entity}` يدعم: `employees`, `attendance`, `leaves`, `departments`, `shifts`, `visitors`, `events`, `violations`, `alerts`, `cameras`, `rules`, `users`, `logs`.

- `GET`: معاملات `page`, `limit` (حتى 100), `q`, و`status` حيث يدعمها المورد.
- `POST`: جسم JSON لحقول السجل.
- `PATCH`: `{ "id": "…", "data": { … } }`.
- `DELETE`: معامل الاستعلام `id`. الحذف يتطلب دور `SUPER_ADMIN`.

المسارات تعيد `items`, `total`, `page`, `pages` للقوائم. سجلات التغيير تكتب تلقائيًا إلى سجل التدقيق.

## المؤشرات

- `GET /api/dashboard` — أعداد محفوظة في قاعدة البيانات وحركات حضور اليوم حسب المنطقة الزمنية للمؤسسة.
- `GET /api/alerts/stream` — Server-Sent Events للتنبيهات الجديدة، بعد فحص صلاحية قراءة التنبيهات.
- `GET|PATCH /api/settings` — إعداد المؤسسة؛ التعديل لدور مدير النظام.
- `GET|POST /api/roles` — الأدوار المخصصة؛ الإدارة لدور مدير النظام.

الحالات المستقبلية للكاميرات لا تعني بثًا متصلًا؛ لا توجد واجهة بث في هذا الإصدار.
