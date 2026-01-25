# Workflow: Tạo service mới

Workflow này hướng dẫn tạo **một microservice mới** (NATS-only) trong monorepo `serve/`, tích hợp với api-gateway và shared MongoDB.

---

## Input cần có

- **Tên service** (kebab-case): ví dụ `notification-service`, `analytics-service`
- **Message patterns** (tùy chọn): danh sách pattern và payload, ví dụ `notifications.send`, `notifications.list`
- **Schemas/DTOs** (nếu cần): có dùng collection MongoDB mới hoặc DTO mới trong `@app/common` không?

---

## Các bước thực hiện

### 1. Tạo cấu trúc thư mục và file

Tạo trong `serve/apps/<tên-service>/`:

```
apps/<tên-service>/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── <tên-service>.controller.ts   # ví dụ: notification.controller.ts
│   └── <tên-service>.service.ts
└── tsconfig.app.json
```

### 2. `main.ts`

- Dùng `NestFactory.createMicroservice` (không có HTTP).
- Transport: `Transport.NATS`.
- `options.servers`: `process.env.NATS_URL || 'nats://localhost:4223'`.
- Gọi `app.listen()` và log tên service (NATS only).

Tham khảo: `serve/apps/identity-service/src/main.ts`.

### 3. `app.module.ts`

- `ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })`.
- `DatabaseModule` (nếu service dùng MongoDB).
- `MongooseModule.forFeature([...])` với các schema từ `@app/common` (nếu có).
- Import controller và provider (service) tương ứng.

Tham khảo: `serve/apps/identity-service/src/app.module.ts`.

### 4. `<tên-service>.controller.ts`

- Inject service.
- Dùng `@MessagePattern('<pattern>')` và `@Payload()` cho từng pattern.
- Đặt tên pattern có prefix, ví dụ: `notifications.send`, `notifications.list`.

Tham khảo: `serve/apps/identity-service/src/identity.controller.ts`.

### 5. `<tên-service>.service.ts`

- Inject model (nếu dùng Mongoose) hoặc dependency cần thiết.
- Implement logic tương ứng với từng pattern.

Tham khảo: `serve/apps/identity-service/src/identity.service.ts`.

### 6. `tsconfig.app.json`

- `extends`: `../../tsconfig.json`.
- `compilerOptions.outDir`: `../../dist/apps/<tên-service>`.
- `include`: `["src/**/*"]`.
- `exclude`: `["node_modules", "dist", "test", "**/*spec.ts"]`.

Tham khảo: `serve/apps/identity-service/tsconfig.app.json`.

### 7. Cập nhật `nest-cli.json`

Thêm project mới trong `projects`:

```json
"<tên-service>": {
  "type": "application",
  "root": "apps/<tên-service>",
  "entryFile": "main",
  "sourceRoot": "apps/<tên-service>/src",
  "compilerOptions": {
    "tsConfigPath": "apps/<tên-service>/tsconfig.app.json"
  }
}
```

### 8. Cập nhật `serve/package.json`

- Thêm scripts:
  - `build:<tên-service>`
  - `start:<tên-service>`
  - `start:dev:<tên-service>`
- Trong `start:all`: thêm `pnpm run start:dev:<tên-service>` vào lệnh `concurrently`.

### 9. Tích hợp API Gateway

**`apps/api-gateway/src/app.module.ts`:**

- Thêm entry trong `ClientsModule.register`:
  - `name`: `'<TÊN_SERVICE_UPPER>_SERVICE'` (ví dụ `NOTIFICATION_SERVICE`).
  - `transport`: `Transport.NATS`.
  - `options.servers`: giống các service khác.

**`apps/api-gateway/src/app.controller.ts`:**

- Inject `ClientProxy` tương ứng (`@Inject('...')`).
- Thêm route HTTP (GET/POST/...) gọi `client.send('<pattern>', payload)` với `firstValueFrom`.

### 10. (Tùy chọn) Schemas / DTOs trong `libs/common`

- Nếu cần schema mới: thêm trong `libs/common/src/schemas/`, export qua `schemas/index.ts`.
- Nếu cần DTO mới: thêm trong `libs/common/src/dtos/`, export qua `dtos/index.ts`.
- Dùng `MongooseModule.forFeature` và import từ `@app/common` trong `app.module` của service.

### 11. Cập nhật tài liệu

- Cập nhật `serve/README.md`: thêm service mới vào Architecture Overview và phần chạy từng service.
- Cập nhật `AGENTS.md`: thêm service vào Project Structure và ghi chú nếu cần.

---

## Checklist

- [ ] Đã tạo `main.ts`, `app.module.ts`, controller, service, `tsconfig.app.json`
- [ ] Đã cập nhật `nest-cli.json`
- [ ] Đã cập nhật `package.json` (build, start, start:dev, start:all)
- [ ] Đã thêm NATS client trong api-gateway và route HTTP tương ứng
- [ ] Đã thêm/export schema/DTO trong `@app/common` nếu cần
- [ ] Đã cập nhật README và AGENTS.md

---

## Lưu ý

- Service mới **chỉ chạy NATS**, không expose HTTP.
- Toàn bộ HTTP vào qua **api-gateway** (port 3000).
- Dùng **DatabaseModule** và schema trong **`@app/common`**; không tạo kết nối MongoDB riêng.
