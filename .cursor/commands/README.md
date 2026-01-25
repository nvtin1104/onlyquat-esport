# Cursor Commands

Các command hướng dẫn AI (và developer) thực hiện tác vụ chuẩn trong dự án **onlyquat-esport** / **serve**.

## Commands có sẵn

| Command | Mô tả |
|---------|--------|
| [create-service](./create-service.md) | Tạo microservice mới (NATS-only) trong monorepo, tích hợp api-gateway và shared MongoDB |
| [add-feature](./add-feature.md) | Thêm tính năng mới (endpoint, message pattern, schema/DTO) vào service có sẵn hoặc mới |
| [update-agents](./update-agents.md) | Tự động cập nhật AGENTS.md theo cấu trúc hệ thống hiện tại (services, schemas, DTOs, scripts) |

## Cách dùng

1. Mở command tương ứng (markdown).
2. Làm theo từng bước và checklist.
3. Tham khảo file hiện có trong `serve/apps/` và `serve/libs/common/` khi implement.

Khi dùng Cursor, có thể @ mention file command (ví dụ `@.cursor/commands/create-service.md`) để AI bám theo các bước.

**Lưu ý:** Sau khi thêm service mới hoặc thay đổi cấu trúc, chạy `update-agents` để đồng bộ AGENTS.md.
