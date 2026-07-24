# Доменная модель и черновой API

Документ определяет семантику целевого MVP. Конкретная OpenAPI-схема и сгенерированные типы появятся на этапе функционального MVP. До этого контракт имеет статус чернового.

## 1. Общие правила

- Базовый путь REST: `/api/v1`.
- Формат тела и ошибок: JSON UTF-8; время — UTC в RFC 3339.
- Идентификаторы — непрозрачные UUID и не несут бизнес-смысла.
- Авторизация — `Authorization: Bearer <access-token>`.
- Создающие и отправляющие команды требуют `Idempotency-Key`, созданный клиентом и стабильный при повторе.
- Списки используют cursor pagination: `limit` и `cursor`; offset pagination не применяется к истории сообщений и событий.
- Ошибка имеет форму `{"error":{"code":"...","message":"...","details":{}}}`. `message` безопасно показывать пользователю, `code` стабилен для клиентской логики.

## 2. Сущности

### User

`id`, `login`, `displayName`, `position`, `departmentId`, `status`, `blockedAt`, `createdAt`, `updatedAt`.

Логин уникален без учета регистра. Блокировка немедленно запрещает новые операции и отзывает активные сессии.

### Department, Group и Tag

- `Department`: иерархический узел с `parentId`, названием, руководителем и служебным `conversationId`.
- `Group`: управляемая выборка пользователей, не обязательно совпадающая с оргструктурой.
- `Tag`: уникальная административная метка для выбора аудитории и разрешенных массовых упоминаний.

Членство изменяется только административной командой. Изменение подразделения атомарно обновляет доступ к служебным чатам.

### Role, Permission и Scope

Назначение роли связывает `userId`, предопределенную роль, набор дополнительных разрешений и область: организация, список подразделений либо список групп. Эффективное право вычисляется сервером на каждый запрос; UI только скрывает недоступные действия для удобства.

### Conversation и Membership

Типы `Conversation`: `direct`, `public_channel`, `private_channel`, `department_channel`.

Общие поля: `id`, `type`, `name`, `description`, `createdBy`, `archivedAt`, `createdAt`, `updatedAt`. Для direct-чата пара пользователей уникальна. `Membership` хранит пользователя, роль в чате, момент вступления, последний прочитанный sequence и состояние уведомлений.

### Message

Поля: `id`, `conversationId`, `authorId`, `kind`, `text`, `replyToId`, `clientCreatedAt`, `createdAt`, `editedAt`, `deletedAt`, `revokedAt`, `revocationReason`, `criticalDeadline`, `sequence`.

`kind`: `regular`, `critical`, `system`, `dnd_auto_reply`. Вложения и упоминания связаны отдельными записями. Текст после мягкого удаления недоступен обычному API. Критичное сообщение неизменяемо после создания.

### Attachment

Поля: `id`, `ownerId`, `originalName`, `mediaType`, `size`, `sha256`, `state`, `storageKey`, `createdAt`, `attachedAt`.

Состояния: `uploading`, `ready`, `attached`, `expired`, `deleted`. Доступ к скачиванию всегда вычисляется через связанное сообщение или объявление; прямой storage path клиенту не возвращается.

### Announcement

Поля: `id`, `authorId`, `title`, `text`, `critical`, `criticalDeadline`, `status`, `audienceSpec`, `audienceCount`, `createdAt`, `sentAt`, `revokedAt`, `revocationReason`.

`audienceSpec` сохраняет исходные критерии, а `AnnouncementRecipient` — дедуплицированный снимок адресатов на момент отправки. Последующие изменения тегов или подразделений не меняют уже отправленную аудиторию.

### Receipt

Ключ — тип объекта и пара `objectId + recipientId`. Времена `deliveredAt`, `readAt`, `acknowledgedAt` монотонны: подтверждение подразумевает просмотр, просмотр подразумевает доставку. Повторная команда не меняет первое зафиксированное время.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Delivered
    Delivered --> Read
    Read --> Acknowledged
```

### Presence

Поля: `userId`, `mode`, `statusText`, `expiresAt`, `lastActivityAt`, `dndSessionId`, `autoReplyText`, `updatedAt`. `mode`: `working`, `away`, `dnd`, `offline`.

Presence — оперативное состояние и не является доказательством фактического нахождения сотрудника за компьютером.

### RetentionPolicy и AuditEvent

`RetentionPolicy` задает срок по типу чата/объекта и область действия. Отсутствие политики означает отсутствие автоматического удаления.

`AuditEvent` хранит актера, действие, тип и идентификатор объекта, результат, время, correlation ID и безопасные метаданные. Текст сообщений не копируется в аудит.

## 3. Ключевые инварианты

1. Сервер проверяет членство и scope до чтения объекта и до публикации любого события.
2. Критичное сообщение или отправленное объявление нельзя редактировать; отзыв сохраняет объект и квитанции.
3. Аудитория объявления является неизменяемым снимком после отправки.
4. Один idempotency key в пределах пользователя и операции соответствует одному результату и одному hash входных данных.
5. Повторное использование ключа с другим телом возвращает `409 idempotency_conflict`.
6. Состояния квитанций движутся только вперед.
7. Автоответ создается не более одного раза для пары «DND-сессия + отправитель» и сам не инициирует автоответ.
8. Системное время клиента не определяет порядок сообщений, сроки или права.
9. Удаление доступа порождает событие очистки кеша и запрещает дальнейшую загрузку вложений.

## 4. REST-ресурсы

### Аутентификация

| Метод и путь | Назначение |
| --- | --- |
| `POST /auth/login` | Логин/пароль, выдача access и refresh token |
| `POST /auth/refresh` | Ротация refresh token |
| `POST /auth/logout` | Отзыв текущей сессии |
| `POST /auth/ws-ticket` | Короткоживущий одноразовый ticket для открытия WebSocket |
| `GET /me` | Текущий пользователь, роли, scope и настройки |

### Оргструктура и администрирование

| Метод и путь | Назначение |
| --- | --- |
| `GET/POST /users` | Список и создание пользователей |
| `PATCH /users/{id}` | Профиль, блокировка и подразделение |
| `POST /users/{id}/reset-password` | Административный сброс с принудительной сменой |
| `GET/POST/PATCH /departments` | Дерево подразделений |
| `GET/POST/PATCH /groups` | Служебные группы и членство |
| `GET/POST/PATCH /tags` | Теги и членство |
| `GET/POST/DELETE /role-assignments` | Назначения ролей и scope |
| `GET /audit-events` | Фильтрованный административный аудит |

### Чаты и сообщения

| Метод и путь | Назначение |
| --- | --- |
| `GET/POST /conversations` | Доступные чаты и создание канала/диалога |
| `GET /conversations/{id}/messages` | История назад от cursor |
| `POST /conversations/{id}/messages` | Отправка сообщения |
| `PATCH /messages/{id}` | Редактирование обычного сообщения |
| `DELETE /messages/{id}` | Мягкое удаление обычного сообщения |
| `POST /messages/{id}/revoke` | Отзыв критичного сообщения с причиной |
| `POST/DELETE /messages/{id}/reactions/{emoji}` | Реакция текущего пользователя |
| `POST/DELETE /messages/{id}/pin` | Закрепление и открепление |
| `POST /messages/{id}/read` | Фиксация просмотра |
| `POST /messages/{id}/acknowledge` | Явное «Ознакомлен» |
| `POST /receipts/delivered` | Пакетная фиксация доставки объектов клиенту |
| `GET /search/messages` | Полнотекстовый поиск в доступной области |

### Объявления и вложения

| Метод и путь | Назначение |
| --- | --- |
| `POST /announcements/preview` | Проверка прав и дедуплицированная аудитория без отправки |
| `POST /announcements` | Отправка по ранее подтвержденной спецификации |
| `GET /announcements` | Доступные входящие и отправленные объявления |
| `GET /announcements/{id}/stats` | Агрегаты и разрешенные списки квитанций |
| `POST /announcements/{id}/read` | Фиксация просмотра объявления |
| `POST /announcements/{id}/acknowledge` | Явное подтверждение критичного объявления |
| `POST /announcements/{id}/revoke` | Отзыв с причиной |
| `POST /attachments` | Потоковая загрузка одного файла |
| `GET /attachments/{id}` | Авторизованное скачивание |

Preview возвращает краткоживущий `previewToken`, hash нормализованной аудитории и итоговое количество. Отправка принимает token; при изменении аудитории или истечении token требует новый preview.

### Синхронизация и присутствие

| Метод и путь | Назначение |
| --- | --- |
| `GET /sync?after={sequence}` | Восстановление долговечных событий после курсора |
| `PUT /presence` | Ручной статус, DND, срок и автоответ |
| `POST /conversations/{id}/typing` | Эфемерный typing-сигнал |

## 5. WebSocket-контракт

Подключение: `WSS /api/v1/events?after=<sequence>`. Аутентификация передается одноразовым ticket, предварительно полученным по HTTPS; bearer token не помещается в URL.

Базовый envelope:

```json
{
  "eventId": "uuid",
  "sequence": 10428,
  "type": "message.created",
  "occurredAt": "2026-07-24T08:30:00Z",
  "resourceId": "uuid",
  "payload": {}
}
```

Долговечные типы событий:

- `message.created`, `message.updated`, `message.deleted`, `message.revoked`;
- `reaction.changed`, `pin.changed`;
- `receipt.changed`;
- `announcement.created`, `announcement.revoked`;
- `conversation.changed`, `membership.changed`, `access.revoked`;
- `user.changed`, `policy.changed`.

Эфемерные события без `sequence`: `presence.changed`, `typing.started`, `typing.stopped`. Потеря такого события допустима; у него есть короткий TTL.

Клиент подтверждает последний примененный долговечный sequence. При неизвестном или слишком старом курсоре сервер отвечает `resync_required`, после чего клиент выполняет полную разрешенную синхронизацию.

## 6. Коды ошибок

Минимальный стабильный набор: `invalid_credentials`, `session_revoked`, `forbidden`, `not_found`, `validation_failed`, `edit_window_expired`, `immutable_message`, `attachment_too_large`, `idempotency_conflict`, `preview_expired`, `audience_changed`, `rate_limited`, `resync_required`, `server_version_incompatible`.

`403` и `404` выбираются так, чтобы не раскрывать существование приватного ресурса. Детальная причина отказа записывается в серверный аудит, но не возвращается неавторизованному пользователю.
