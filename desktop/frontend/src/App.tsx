import {FormEvent, useMemo, useState} from 'react';
import './App.css';

type Role = 'Сотрудник' | 'Коммуникатор' | 'Администратор';
type Delivery = 'sent' | 'queued';

type Chat = {
    id: string;
    title: string;
    kind: 'Личный' | 'Подразделение' | 'Публичный' | 'Приватный';
    icon: string;
    unread?: number;
    muted?: boolean;
};

type Message = {
    id: number;
    author: string;
    initials: string;
    time: string;
    text: string;
    delivery?: Delivery;
    critical?: boolean;
    acknowledged?: boolean;
    mention?: boolean;
    reaction?: string;
};

const chats: Chat[] = [
    {id: 'support', title: 'Отдел мер поддержки', kind: 'Подразделение', icon: 'МП', unread: 3},
    {id: 'anna', title: 'Анна Петрова', kind: 'Личный', icon: 'АП'},
    {id: 'news', title: 'Новости управления', kind: 'Публичный', icon: '#', unread: 1},
    {id: 'project', title: 'Проект «Навигатор»', kind: 'Приватный', icon: '◆', muted: true},
];

const initialMessages: Message[] = [
    {
        id: 1,
        author: 'Марина Соколова',
        initials: 'МС',
        time: '09:42',
        text: 'Коллеги, обновила памятку по приёму заявлений. Файл закреплён в канале.',
        reaction: '👍 4',
    },
    {
        id: 2,
        author: 'Илья Морозов',
        initials: 'ИМ',
        time: '10:06',
        text: 'Посмотрел, спасибо. В разделе 3 теперь всё понятно.',
    },
    {
        id: 3,
        author: 'Ольга Власова',
        initials: 'ОВ',
        time: '10:18',
        text: '@Дмитрий, проверьте, пожалуйста, список получателей до 12:00.',
        mention: true,
    },
    {
        id: 4,
        author: 'Марина Соколова',
        initials: 'МС',
        time: '10:24',
        text: 'С 14:00 меняется порядок обработки срочных обращений. Ознакомьтесь до начала смены.',
        critical: true,
        acknowledged: false,
    },
];

function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [role, setRole] = useState<Role>('Сотрудник');
    const [online, setOnline] = useState(true);
    const [rightPanel, setRightPanel] = useState(true);
    const [scenarioPanel, setScenarioPanel] = useState(false);
    const [activeChat, setActiveChat] = useState(chats[0].id);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [draft, setDraft] = useState('');
    const [criticalDraft, setCriticalDraft] = useState(false);
    const [activeSection, setActiveSection] = useState<'chats' | 'attention'>('chats');

    const currentChat = chats.find((chat) => chat.id === activeChat) ?? chats[0];
    const attentionCount = messages.filter((message) => message.mention || (message.critical && !message.acknowledged)).length;
    const queuedCount = messages.filter((message) => message.delivery === 'queued').length;

    const visibleMessages = useMemo(() => {
        if (activeSection === 'attention') {
            return messages.filter((message) => message.mention || (message.critical && !message.acknowledged));
        }
        return messages;
    }, [activeSection, messages]);

    function sendMessage(event: FormEvent) {
        event.preventDefault();
        const text = draft.trim();
        if (!text) return;

        setMessages((items) => [...items, {
            id: Math.max(...items.map((item) => item.id), 0) + 1,
            author: 'Дмитрий Волков',
            initials: 'ДВ',
            time: 'сейчас',
            text,
            critical: criticalDraft,
            delivery: online ? 'sent' : 'queued',
        }]);
        setDraft('');
        setCriticalDraft(false);
    }

    function toggleConnection() {
        setOnline((current) => {
            const next = !current;
            if (next) {
                setMessages((items) => items.map((message) =>
                    message.delivery === 'queued' ? {...message, delivery: 'sent'} : message,
                ));
            }
            return next;
        });
    }

    function acknowledge(id: number) {
        setMessages((items) => items.map((message) =>
            message.id === id ? {...message, acknowledged: true} : message,
        ));
    }

    function addIncomingMention() {
        setMessages((items) => [...items, {
            id: Math.max(...items.map((item) => item.id), 0) + 1,
            author: 'Анна Петрова',
            initials: 'АП',
            time: 'сейчас',
            text: '@Дмитрий, добавила новые данные по обращению № 1842.',
            mention: true,
        }]);
    }

    function resetScenario() {
        setMessages(initialMessages);
        setOnline(true);
        setRole('Сотрудник');
        setDraft('');
        setCriticalDraft(false);
        setActiveSection('chats');
    }

    return (
        <div className="app" data-theme={theme}>
            {!online && (
                <div className="offline-banner" role="status">
                    <span>● Нет соединения</span>
                    <span>История доступна из кеша · в очереди: {queuedCount}</span>
                    <button type="button" onClick={toggleConnection}>Восстановить</button>
                </div>
            )}

            <div className="workspace">
                <aside className="sidebar" aria-label="Навигация и чаты">
                    <div className="brand">
                        <div className="brand-mark" aria-hidden="true">У</div>
                        <div><strong>USZN</strong><span>Messenger</span></div>
                        <button className="icon-button" type="button" aria-label="Открыть панель сценариев" onClick={() => setScenarioPanel(true)}>⌘</button>
                    </div>

                    <label className="search">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" placeholder="Поиск" aria-label="Глобальный поиск"/>
                        <kbd>Ctrl K</kbd>
                    </label>

                    <nav className="primary-nav" aria-label="Основные разделы">
                        <button className={activeSection === 'attention' ? 'active' : ''} type="button" onClick={() => setActiveSection('attention')}>
                            <span aria-hidden="true">◇</span> Внимание <b>{attentionCount}</b>
                        </button>
                        <button type="button"><span aria-hidden="true">▱</span> Объявления <b>1</b></button>
                        <button type="button"><span aria-hidden="true">◎</span> Сотрудники</button>
                        {role === 'Администратор' && <button type="button"><span aria-hidden="true">⚙</span> Администрирование</button>}
                    </nav>

                    <div className="list-heading">
                        <span>Чаты</span><button type="button" aria-label="Создать чат">＋</button>
                    </div>
                    <div className="chat-list">
                        {chats.map((chat) => (
                            <button
                                type="button"
                                className={activeSection === 'chats' && activeChat === chat.id ? 'chat active' : 'chat'}
                                key={chat.id}
                                onClick={() => { setActiveChat(chat.id); setActiveSection('chats'); }}
                            >
                                <span className="avatar small">{chat.icon}</span>
                                <span className="chat-label"><strong>{chat.title}</strong><small>{chat.kind}</small></span>
                                {chat.muted && <span aria-label="Уведомления отключены">⌁</span>}
                                {chat.unread && <b className="badge">{chat.unread}</b>}
                            </button>
                        ))}
                    </div>

                    <button className="profile" type="button" aria-label="Открыть профиль и статус">
                        <span className="avatar online">ДВ</span>
                        <span><strong>Дмитрий Волков</strong><small>Работаю · {role}</small></span>
                        <span aria-hidden="true">•••</span>
                    </button>
                </aside>

                <main className="conversation">
                    <header className="conversation-header">
                        <div>
                            <span className="avatar small">{activeSection === 'attention' ? '◇' : currentChat.icon}</span>
                            <span><strong>{activeSection === 'attention' ? 'Внимание' : currentChat.title}</strong><small>{activeSection === 'attention' ? `${attentionCount} актуальных элемента` : '18 участников · 7 в сети'}</small></span>
                        </div>
                        <div className="header-actions">
                            <button className="icon-button" type="button" aria-label="Закреплённые сообщения">⌖<span>2</span></button>
                            <button className="icon-button" type="button" aria-label="Поиск в чате">⌕</button>
                            <button className="icon-button" type="button" aria-label={rightPanel ? 'Скрыть правую панель' : 'Показать правую панель'} onClick={() => setRightPanel((value) => !value)}>◫</button>
                        </div>
                    </header>

                    <section className="message-list" aria-label={activeSection === 'attention' ? 'Элементы, требующие внимания' : 'История сообщений'}>
                        <div className="day-divider"><span>Сегодня</span></div>
                        {activeSection === 'attention' && (
                            <div className="attention-tabs" role="group" aria-label="Фильтр внимания">
                                <button className="active" type="button">Все {attentionCount}</button>
                                <button type="button">Упоминания 1</button>
                                <button type="button">Требуют ознакомления 1</button>
                            </div>
                        )}
                        {visibleMessages.map((message) => (
                            <article className={`message${message.critical ? ' critical' : ''}${message.mention ? ' mention' : ''}`} key={message.id}>
                                <span className="avatar">{message.initials}</span>
                                <div className="message-body">
                                    <div className="message-meta"><strong>{message.author}</strong><time>{message.time}</time></div>
                                    {message.critical && <div className="critical-label">⚠ Критичное сообщение</div>}
                                    <p>{message.text}</p>
                                    {message.reaction && <button className="reaction" type="button">{message.reaction}</button>}
                                    {message.critical && (
                                        message.acknowledged
                                            ? <div className="acknowledged">✓ Ознакомлен сегодня в 10:31</div>
                                            : <button className="ack-button" type="button" onClick={() => acknowledge(message.id)}>Ознакомлен</button>
                                    )}
                                    {message.delivery === 'queued' && <div className="delivery queued">◷ В очереди — отправится после восстановления связи</div>}
                                    {message.delivery === 'sent' && <div className="delivery">✓ Отправлено</div>}
                                    {activeSection === 'attention' && <button className="context-link" type="button" onClick={() => setActiveSection('chats')}>Открыть в контексте →</button>}
                                </div>
                            </article>
                        ))}
                    </section>

                    {activeSection === 'chats' && (
                        <form className="composer" onSubmit={sendMessage}>
                            {!online && <div className="composer-notice">Текст будет поставлен в очередь. Новые вложения недоступны без соединения.</div>}
                            <div className="composer-box">
                                <button type="button" className="attach" aria-label="Добавить вложение" disabled={!online}>＋</button>
                                <textarea
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            event.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    rows={1}
                                    aria-label="Сообщение"
                                    placeholder={`Сообщение в «${currentChat.title}»`}
                                />
                                {(role === 'Коммуникатор' || role === 'Администратор') && (
                                    <label className="critical-toggle">
                                        <input type="checkbox" checked={criticalDraft} onChange={(event) => setCriticalDraft(event.target.checked)}/>
                                        <span>Важно</span>
                                    </label>
                                )}
                                <button type="submit" className="send" aria-label="Отправить сообщение" disabled={!draft.trim()}>➤</button>
                            </div>
                            <small>Enter — отправить · Shift+Enter — новая строка</small>
                        </form>
                    )}
                </main>

                {rightPanel && (
                    <aside className="details" aria-label="Участники чата">
                        <div className="details-heading"><strong>Участники</strong><span>18</span></div>
                        <label className="search compact"><span aria-hidden="true">⌕</span><input type="search" placeholder="Найти участника" aria-label="Найти участника"/></label>
                        <div className="member-group"><span>В сети — 3</span>
                            <Member initials="МС" name="Марина Соколова" role="Руководитель отдела" status="online"/>
                            <Member initials="ОВ" name="Ольга Власова" role="Коммуникатор" status="online"/>
                            <Member initials="ИМ" name="Илья Морозов" role="Специалист" status="away"/>
                        </div>
                        <div className="member-group"><span>Не в сети — 2</span>
                            <Member initials="АП" name="Анна Петрова" role="Специалист" status="offline"/>
                            <Member initials="СК" name="Сергей Ким" role="Специалист" status="offline"/>
                        </div>
                    </aside>
                )}
            </div>

            <div className="prototype-label">UX-ПРОТОТИП · МОК-ДАННЫЕ</div>

            {scenarioPanel && (
                <div className="drawer-backdrop" onMouseDown={() => setScenarioPanel(false)}>
                    <aside className="scenario-drawer" aria-label="Панель сценариев" onMouseDown={(event) => event.stopPropagation()}>
                        <header><div><span>ПРОТОТИП</span><h2>Панель сценариев</h2></div><button className="icon-button" type="button" aria-label="Закрыть" onClick={() => setScenarioPanel(false)}>×</button></header>
                        <p>Изменения действуют только в текущем запуске и не обращаются к серверу.</p>

                        <label className="field"><span>Роль пользователя</span>
                            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                                <option>Сотрудник</option><option>Коммуникатор</option><option>Администратор</option>
                            </select>
                        </label>
                        <div className="field"><span>Соединение</span>
                            <button className={`scenario-action ${online ? '' : 'danger'}`} type="button" onClick={toggleConnection}>{online ? 'Имитировать потерю связи' : 'Восстановить соединение'}</button>
                        </div>
                        <div className="field"><span>Входящее событие</span>
                            <button className="scenario-action" type="button" onClick={addIncomingMention}>Получить @упоминание</button>
                        </div>
                        <div className="field"><span>Оформление</span>
                            <div className="segmented"><button className={theme === 'dark' ? 'active' : ''} type="button" onClick={() => setTheme('dark')}>Тёмное</button><button className={theme === 'light' ? 'active' : ''} type="button" onClick={() => setTheme('light')}>Светлое</button></div>
                        </div>
                        <button className="reset" type="button" onClick={resetScenario}>Сбросить мок-состояние</button>
                    </aside>
                </div>
            )}
        </div>
    );
}

function Member({initials, name, role, status}: {initials: string; name: string; role: string; status: 'online' | 'away' | 'offline'}) {
    return <button className="member" type="button"><span className={`avatar ${status}`}>{initials}</span><span><strong>{name}</strong><small>{role}</small></span></button>;
}

export default App;
