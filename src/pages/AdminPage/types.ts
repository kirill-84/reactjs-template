// Основные типы для вкладок админ-панели
export type AdminTab = 'users';

// Типы для пользователей
export interface User {
    id: string;
    telegram_id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_admin: boolean;
    created_at: string;
    last_login?: string;
    updated_at?: string;
}