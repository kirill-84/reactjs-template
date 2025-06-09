import { FC, useMemo, useState, useEffect } from 'react';
import {
    initDataState as _initDataState,
    useSignal,
} from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import AuthStatusIndicator from '@/components/AuthStatusIndicator';
import './ProfileMain.css';

export const ProfileMain: FC = () => {
    const initDataState = useSignal(_initDataState);
    const { supabaseUser, loading, error } = useSupabaseUser(initDataState);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
    const [setProgressWidth] = useState(0);

    // Тестовые данные для показа UI
    const dummyStats = useMemo(() => ({
        strengthLevel: 5,
        subscriptionPlan: 'Pro',
        subscriptionStatus: 'active',
        expiryDate: '2025-07-31',
        practiceMinutes: 350,
        practiceDays: 18,
        weeklyActivity: [30, 45, 20, 50, 65, 40, 25]
    }), []);

    // Пользователь из initData
    const user = useMemo(() =>
            initDataState && initDataState.user ? initDataState.user : undefined,
        [initDataState]);

    // Анимация прогресса
    useEffect(() => {
        if (!loading && user) {
            const timer = setTimeout(() => {
                setProgressWidth((dummyStats.strengthLevel / 10) * 100);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, user, dummyStats.strengthLevel]);

    // Если данные пользователя загружаются
    if (loading) {
        return (
            <Page>
                <div className="profile-loading">
                    <div className="profile-loading-spinner" aria-hidden="true" />
                    <p>Загрузка профиля...</p>
                </div>
            </Page>
        );
    }

    // Если есть ошибка при получении данных
    if (error) {
        return (
            <Page>
                <div className="profile-error">
                    <div className="profile-error-icon" aria-hidden="true">⚠️</div>
                    <h2>Ошибка</h2>
                    <p>{error.message}</p>
                </div>
            </Page>
        );
    }

    // Если нет данных пользователя
    if (!user) {
        return (
            <Page>
                <div className="profile-error">
                    <div className="profile-error-icon" aria-hidden="true">⚠️</div>
                    <h2>Нет данных</h2>
                    <p>Не удалось получить данные пользователя</p>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <div className="profile-main">
                {/* Верхний блок с аватаром и данными пользователя */}
                <div className="profile-header">
                    <div className="profile-avatar-container">
                        {user.photo_url ? (
                            <img
                                src={user.photo_url}
                                alt={user.username || user.first_name}
                                className="profile-avatar"
                                loading="eager"
                            />
                        ) : (
                            <div className="profile-avatar-placeholder" aria-hidden="true">
                                {user.first_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="profile-user-info">
                        <h1 className="profile-name">
                            {user.first_name} {user.last_name || ''}
                            <AuthStatusIndicator isAuthenticated={!!supabaseUser} className="ml-2" />
                        </h1>
                        {user.username && (
                            <p className="profile-username">@{user.username}</p>
                        )}
                        <div className="profile-subscription">
                            <span className="profile-plan">{dummyStats.subscriptionPlan}</span>
                            <span className="profile-status">{dummyStats.subscriptionStatus === 'active' ? 'Активна' : 'Неактивна'}</span>
                            <span className="profile-expiry">до {new Date(dummyStats.expiryDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                </div>

                {/* Блок с выбором вкладки */}
                <div className="profile-tabs">
                    <button
                        className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Настройки
                    </button>
                </div>

                {/* Блок с настройками */}
                {activeTab === 'settings' && (
                    <div className="profile-settings">
                        <p className="settings-info">Настройки профиля будут доступны в следующем обновлении.</p>

                        {/* Кнопка для администраторов, видна только если у пользователя есть права админа */}
                        {supabaseUser?.is_admin && (
                            <div className="admin-button-container">
                                <button
                                    className="action-button admin-button"
                                    onClick={() => navigate('/admin')}
                                >
                                    Панель администратора
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Блок с кнопками действий */}
                <div className="profile-actions">
                    <button className="action-button primary" onClick={() => navigate('#')}>
                        Продлить подписку
                    </button>
                </div>
            </div>
        </Page>
    );
};