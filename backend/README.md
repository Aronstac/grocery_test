# GroceryOps Backend API

Повноцінний бекенд для системи логістики продуктового магазину, побудований на Node.js + Express з інтеграцією Supabase.

## 🚀 Особливості

- **REST API** з повним CRUD функціоналом
- **Автентифікація та авторизація** на основі ролей
- **Валідація даних** з використанням Zod
- **Логування** з Winston
- **Rate limiting** для захисту від зловживань
- **Email сервіс** для запрошень
- **Безпека** з Helmet та CORS
- **Масштабованість** з модульною архітектурою
- **Seed скрипт** для заповнення тестовими даними

## 📁 Структура проекту

```
backend/
├── src/
│   ├── config/          # Конфігурація (Supabase, база даних)
│   ├── middleware/      # Middleware (auth, validation, errors)
│   ├── routes/          # API маршрути
│   ├── services/        # Бізнес-логіка та сервіси
│   ├── utils/           # Утиліти (logger, helpers)
│   └── server.js        # Головний файл сервера
├── logs/                # Лог файли
├── seed.ts              # Скрипт для заповнення БД
├── .env.example         # Приклад змінних середовища
└── package.json
```

## 🛠 Встановлення

1. **Клонування та встановлення залежностей:**
```bash
cd backend
npm install
```

2. **Налаштування змінних середовища:**
```bash
cp .env.example .env
# Відредагуйте .env файл з вашими даними
```

3. **Заповнення бази даних тестовими даними:**
```bash
npm run seed
```

4. **Запуск в режимі розробки:**
```bash
npm run dev
```

5. **Запуск в продакшені:**
```bash
npm start
```

## 🌱 Seed Script

Скрипт `seed.ts` створює повноцінну тестову базу даних з українськими даними:

### Що створюється:
- **2 магазини** (Київ, Львів)
- **3 постачальники** з українськими назвами
- **3 склади** з реалістичними адресами
- **10 продуктів** з українськими назвами
- **4 користувачі** з різними ролями
- **Співробітники** з прив'язкою до користувачів
- **Інвентар** та **поставки**
- **Події доставки** та **сповіщення**
- **Паливні картки** для водіїв
- **Запрошення** нових співробітників

### Тестові акаунти:
```
Admin:      admin@groceryops.ua      / Admin123!
Logistics:  logistics@groceryops.ua  / Logistics123!
Driver:     driver@groceryops.ua     / Driver123!
Warehouse:  warehouse@groceryops.ua  / Warehouse123!
```

### Запуск:
```bash
npm run seed
```

## 🔧 Змінні середовища

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Автентифікація
- `POST /api/auth/create-admin` - Створення адміністратора та магазину
- `POST /api/auth/signin` - Вхід в систему
- `POST /api/auth/signout` - Вихід з системи
- `GET /api/auth/me` - Отримання поточного користувача

### Запрошення
- `POST /api/invitations` - Створення запрошення (admin)
- `POST /api/invitations/accept` - Прийняття запрошення
- `GET /api/invitations` - Список запрошень (admin)
- `DELETE /api/invitations/:id` - Видалення запрошення (admin)

### Продукти
- `GET /api/products` - Список продуктів
- `GET /api/products/:id` - Деталі продукту
- `POST /api/products` - Створення продукту (logistics+)
- `PUT /api/products/:id` - Оновлення продукту (logistics+)
- `DELETE /api/products/:id` - Видалення продукту (logistics+)
- `PATCH /api/products/:id/stock` - Оновлення запасів (logistics+)

### Поставки
- `GET /api/deliveries` - Список поставок
- `GET /api/deliveries/:id` - Деталі поставки
- `POST /api/deliveries` - Створення поставки (logistics+)
- `PATCH /api/deliveries/:id/status` - Оновлення статусу
- `PATCH /api/deliveries/:id/assign-driver` - Призначення водія (logistics+)

### Співробітники
- `GET /api/employees` - Список співробітників
- `GET /api/employees/:id` - Деталі співробітника
- `PUT /api/employees/:id` - Оновлення співробітника
- `DELETE /api/employees/:id` - Видалення співробітника (admin)

## 🔐 Ролі та дозволи

### Admin
- Повний доступ до всіх функцій
- Управління співробітниками та запрошеннями
- Управління магазинами

### Logistics Specialist
- Управління продуктами та запасами
- Управління поставками
- Призначення водіїв

### Driver
- Перегляд призначених поставок
- Оновлення статусу поставок
- Звіти про проблеми

### Warehouse Worker
- Перегляд завдань
- Сканування продуктів
- Звіти про проблеми

## 🛡 Безпека

- **Helmet** для захисту HTTP заголовків
- **CORS** налаштований для фронтенду
- **Rate Limiting** для запобігання зловживанням
- **JWT токени** для автентифікації
- **Валідація даних** на всіх endpoints
- **RLS (Row Level Security)** через Supabase

## 📝 Логування

Система використовує Winston для логування:
- `logs/error.log` - тільки помилки
- `logs/combined.log` - всі логи
- Консоль - в режимі розробки

## 🧪 Тестування

```bash
npm test
```

## 📈 Моніторинг

Health check endpoint доступний за адресою:
```
GET /health
```

Повертає статус сервера, час роботи та інформацію про середовище.

## 🚀 Деплой

1. **Встановіть змінні середовища** для продакшену
2. **Запустіть білд:**
```bash
npm run build
```
3. **Запустіть сервер:**
```bash
npm start
```

## 🔄 Інтеграція з фронтендом

Замініть Edge Function виклики на HTTP запити до цього API:

```javascript
// Замість Edge Function
const response = await supabase.functions.invoke('create-admin', { body: data });

// Використовуйте HTTP запит
const response = await fetch('/api/auth/create-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

## 🇺🇦 Українська локалізація

Seed скрипт створює дані з українською локалізацією:
- Українські назви компаній та продуктів
- Реалістичні адреси українських міст
- Телефони у форматі +380XXXXXXXXX
- ЄДРПОУ та ІПН коди
- Поштові індекси України

## 📞 Підтримка

Для питань та підтримки створіть issue в репозиторії або зв'яжіться з командою розробки.