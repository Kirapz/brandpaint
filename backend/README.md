# BrandPaint Backend

Backend API для BrandPaint - генератора макетів сайтів з AI.

## Деплой на Render

### 1. Підготовка

1. Переконайся що всі залежності встановлені:
```bash
npm install
```

2. Створи Firebase Service Account:
   - Йди в Firebase Console → Project Settings → Service Accounts
   - Натисни "Generate new private key"
   - Завантаж JSON файл з ключами

### 2. Налаштування змінних середовища на Render

В панелі Render додай ці змінні:

```
NODE_ENV=production
PORT=5000

# База даних
DB_USER=kira
DB_HOST=dpg-d5dcok1r0fns73agss5g-a.oregon-postgres.render.com
DB_NAME=brandpaint_db
DB_PASSWORD=rdtBiqx1A2rNpaslnEr9gte7SFkPGuoy
DB_PORT=5432

# Firebase Admin SDK (з твого service account JSON)
FIREBASE_PROJECT_ID=brandpaint-784a0
FIREBASE_PRIVATE_KEY_ID=твій_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nтвій_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@brandpaint-784a0.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=твій_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### 3. Деплой

1. Підключи GitHub репозиторій до Render
2. Вибери папку `backend` як root directory
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Додай всі змінні середовища
6. Deploy!

## API Endpoints

### Генерація макетів
- `POST /api/generate` - Генерація макету

### Авторизація
- `GET /api/auth/profile` - Отримати профіль користувача
- `PUT /api/auth/profile` - Оновити профіль

### Проекти
- `GET /api/projects` - Всі проекти користувача
- `POST /api/projects` - Створити проект
- `GET /api/projects/:id` - Отримати проект
- `PUT /api/projects/:id` - Оновити проект
- `DELETE /api/projects/:id` - Видалити проект

### Утиліти
- `GET /health` - Перевірка здоров'я сервера
- `GET /` - Інформація про API

## Локальна розробка

```bash
npm run dev
```

Сервер запуститься на http://localhost:5000