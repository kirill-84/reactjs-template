import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    initDataState as _initDataState,
    useSignal,
} from '@tma.js/sdk-react';
import { Page } from '@/components/Page';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { MdLogout } from 'react-icons/md';
import './AdminPage.css';

// Импорт компонентов админ-панели
import {
    UsersManager
} from './components';

// Импорт типов
import type { AdminTab } from './types';

// Добавляем класс admin-mode к body при монтировании компонента
const addBodyClass = () => {
    document.body.classList.add('admin-mode');
    return () => {
        document.body.classList.remove('admin-mode');
    };
};

const AdminPage: React.FC = () => {
    const initDataState = useSignal(_initDataState);
    const { supabaseUser, loading: userLoading, error: userError } = useSupabaseUser(initDataState);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Добавляем класс 'admin-mode' к body при монтировании компонента
    useEffect(() => {
        return addBodyClass();
    }, []);

    // Проверяем права администратора
    useEffect(() => {
        if (!userLoading) {
            if (userError) {
                setError('Ошибка при загрузке данных пользователя');
            } else if (!supabaseUser) {
                setError('Пользователь не найден');
            } else if (!supabaseUser.is_admin && !passwordAuth) {
                // Если у пользователя нет прав админа, перенаправляем на главную
                navigate('/');
            }
        }
    }, [supabaseUser, userLoading, userError, navigate, passwordAuth]);

    // Обработчик входа по паролю (для дополнительной защиты)
    const checkPassword = () => {
        console.log('checkPassword клик');
        // Захардкоженный пароль для демонстрации
        if (password === 'admin123') {
            setPasswordAuth(true);
            setError(null);
            localStorage.setItem('admin_authenticated', 'true');
        } else {
            setError('Неверный пароль');
        }
    };

    // Проверка аутентификации по паролю при загрузке
    useEffect(() => {
        const isAuth = localStorage.getItem('admin_authenticated') === 'true';
        if (isAuth) {
            setPasswordAuth(true);
        }
    }, []);

    // Обработчик выхода
    const handleLogout = () => {
        console.log('handleLogout клик');
        setPasswordAuth(false);
        localStorage.removeItem('admin_authenticated');
        navigate('/');
    };

    // Если загрузка или нет прав администратора и нет аутентификации по паролю, показываем форму входа
    if (userLoading || (!supabaseUser?.is_admin && !passwordAuth)) {
        return (
            <Page>
                <div className="admin-login">
                    <h1>Вход в Панель Администратора</h1>
                    {userLoading ? (
                        <div className="admin-loading">Проверка прав доступа...</div>
                    ) : (
                        <>
                            {!supabaseUser?.is_admin && (
                                <div className="admin-warning">
                                    У вас нет прав администратора. Введите дополнительный пароль для входа.
                                </div>
                            )}
                            {error && <div className="admin-error">{error}</div>}
                            <input
                                type="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="admin-input"
                            />
                            <button onClick={checkPassword} className="admin-button">
                                Войти
                            </button>
                        </>
                    )}
                </div>
            </Page>
        );
    }

    const handleTabChange = (tab: AdminTab) => {
        console.log('Смена вкладки на:', tab);
        setActiveTab(tab);
    };

    return (
        <Page showTabBar={false}>
            <div className="admin-page">
                <div className="admin-header">
                    <h1>Панель Администратора</h1>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <MdLogout size={18}/>
                        Выйти
                    </button>
                </div>

                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        Пользователи
                    </button>
                </div>

                {/* Контент вкладок */}
                <div className="admin-content">
                    {activeTab === 'users' && <UsersManager />}
                </div>
            </div>
        </Page>
);
};