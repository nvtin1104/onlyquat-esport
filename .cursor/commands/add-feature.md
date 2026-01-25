# Workflow: Thêm tính năng mới

Workflow này hướng dẫn thêm **một tính năng mới** (endpoint, message pattern, schema, v.v.) vào monorepo `serve/`, tuân thủ kiến trúc NATS + api-gateway + shared MongoDB.

---

## Input cần có

- **Mô tả tính năng**: ví dụ “đăng ký user”, “lấy danh sách match theo tournament”, “gửi notification”.
- **Service đích**: tính năng thuộc `identity-service`, `esports-service`, hay service khác? Có cần **service mới** không? (nếu có → dùng workflow [Tạo service mới](./create-service.md) trước.)
- **HTTP không?**: client gọi qua HTTP (api-gateway) hay chỉ nội bộ (NATS giữa các service)?

---

## Các bước thực hiện

### 1. Xác định phạm vi

- **Chỉ NATS (nội bộ):** thêm `@MessagePattern` trong controller của service, implement logic trong service. Bỏ qua bước tích hợp api-gateway.
- **Có HTTP:** cần route trong api-gateway gọi NATS. Thực hiện đủ các bước dưới.

### 2. Schema / DTO (nếu cần)

**Cần collection MongoDB mới:**

- Tạo schema trong `serve/libs/common/src/schemas/<tên>.schema.ts`.
- Export trong `schemas/index.ts`.
- Trong service: `MongooseModule.forFeature([{ name: '...', schema: ... }])`, inject model và dùng trong service.

**Cần DTO (request/response):**

- Tạo DTO trong `serve/libs/common/src/dtos/` (ví dụ `create-<entity>.dto.ts`).
- Dùng `class-validator` cho validation.
- Export trong `dtos/index.ts`.
- Import từ `@app/common` ở controller/service.

**Lưu ý:** Nested object trong schema phải có `@Prop({ type: ... })` rõ ràng (ví dụ `type: Object`), tránh `CannotDetermineTypeError`.

### 3. Message pattern trong service

**Controller (service):**

- Thêm method với `@MessagePattern('<pattern>')`, ví dụ `tournaments.findById`, `user.updateProfile`.
- Dùng `@Payload()` cho body. Type payload theo DTO hoặc interface từ `@app/common`.
- Gọi service method tương ứng.

**Service:**

- Thêm method xử lý logic (DB, validation, v.v.).
- Return đúng kiểu mà api-gateway / client mong đợi.

Đặt tên pattern **nhất quán**: `<domain>.<action>`, ví dụ `auth.login`, `tournaments.create`, `matches.findByTournament`.

### 4. Tích hợp API Gateway (nếu có HTTP)

**`apps/api-gateway/src/app.module.ts`:**

- Nếu tính năng thuộc **service mới**: thêm NATS client trong `ClientsModule.register` (xem workflow [Tạo service mới](./create-service.md)).
- Nếu thuộc service có sẵn: không cần đổi `app.module`.

**`apps/api-gateway/src/app.controller.ts`:**

- Inject `ClientProxy` tương ứng (đã có sẵn nếu cùng service).
- Thêm route HTTP:
  - `@Get(...)` hoặc `@Post(...)` (hoặc PUT, PATCH, DELETE nếu cần).
  - Gọi `firstValueFrom(this.<client>.send('<pattern>', payload))`.
  - Payload lấy từ `@Body()`, `@Param()`, `@Query()` tùy nghiệp vụ.

### 5. Cross-service / cross-collection (nếu có)

- Nếu cần dữ liệu từ collection khác (ví dụ User trong esports-service): dùng **shared DB** + `populate()` hoặc query trực tiếp, **không** gọi sang service khác qua NATS cho việc đọc join.
- Tham khảo: `esports-service` populate `User` trong `findMatchesByTournament`, `findTournamentWithOrganizer`.

### 6. Environment / config

- Biến mới (nếu có): đọc qua `ConfigService` trong service, thêm vào `.env.example` và mô tả trong README.

### 7. Cập nhật tài liệu

- **README:** thêm endpoint mới trong phần API Endpoints (api-gateway).
- **AGENTS.md:** cập nhật nếu có thay đổi cấu trúc, pattern, hoặc quy ước.

---

## Checklist

- [ ] Đã xác định service đích và có HTTP hay không
- [ ] Đã thêm schema/DTO trong `@app/common` nếu cần và export đúng
- [ ] Đã thêm `@MessagePattern` và logic trong controller + service
- [ ] Đã thêm route và `client.send` trong api-gateway nếu có HTTP
- [ ] Đã dùng `populate()`/shared DB thay vì gọi service khác khi chỉ cần join data
- [ ] Đã cập nhật README / AGENTS.md

---

## Ví dụ nhanh

**Thêm “Lấy match theo tournament” (đã có sẵn):**

- Service: `esports-service`.
- Pattern: `matches.findByTournament` (đã có).
- Cần HTTP: thêm `GET /tournaments/:id/matches` trong api-gateway, gọi `esportsClient.send('matches.findByTournament', id)`.

**Thêm “Cập nhật user profile”:**

- Service: `identity-service`.
- DTO: `UpdateProfileDto` trong `libs/common`.
- Pattern: `user.updateProfile`.
- Controller: `@MessagePattern('user.updateProfile')`, nhận `{ userId, ...payload }`.
- Service: `findByIdAndUpdate` hoặc tương đương.
- HTTP: `PATCH /users/:id/profile` trong api-gateway, gọi `identityClient.send('user.updateProfile', { userId, ...body })`.
