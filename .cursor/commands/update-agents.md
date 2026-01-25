# Command: Cập nhật AGENTS.md theo cấu trúc hệ thống

Command này tự động cập nhật `AGENTS.md` dựa trên cấu trúc thực tế của hệ thống (services, schemas, DTOs, scripts).

---

## Các bước thực hiện

### 1. Quét cấu trúc thư mục

**Quét `serve/apps/`:**
- Liệt kê tất cả services trong `serve/apps/`
- Với mỗi service, đọc `src/main.ts` để xác định:
  - **HTTP service**: có `app.listen(<port>)` → ghi port
  - **NATS-only**: dùng `createMicroservice` → ghi "(NATS only)"

**Quét `serve/libs/common/src/schemas/`:**
- Liệt kê tất cả file `*.schema.ts` (bỏ `index.ts`)
- Extract tên schema từ file (ví dụ `user.schema.ts` → `User`)

**Quét `serve/libs/common/src/dtos/`:**
- Liệt kê tất cả file `*.dto.ts` (bỏ `index.ts`)
- Extract tên DTO từ file (ví dụ `create-user.dto.ts` → `CreateUserDto`)

**Đọc `serve/package.json`:**
- Extract tất cả scripts (build, start, start:dev)
- Lưu danh sách services từ scripts (ví dụ `build:identity-service` → `identity-service`)

### 2. Đọc Message Patterns

Với mỗi service trong `serve/apps/*/src/*.controller.ts`:
- Tìm tất cả `@MessagePattern('<pattern>')`
- Ghi lại pattern và service tương ứng

### 3. Cập nhật AGENTS.md

**Phần "Project Structure":**
- Cập nhật cây thư mục với **tất cả services hiện có** từ `serve/apps/`
- Với mỗi service, ghi rõ:
  - `api-gateway` → "HTTP Gateway (Port 3000)"
  - Service khác → "(NATS only)" hoặc port nếu có HTTP

**Phần "Running the Project":**
- Cập nhật danh sách `pnpm run start:dev:<service>` cho **tất cả services** từ package.json
- Giữ format: `pnpm run start:dev:<service-name> # HTTP on :<port>` hoặc `# NATS only`

**Phần "Build":**
- Cập nhật danh sách `pnpm run build:<service>` cho **tất cả services** từ package.json

**Phần "Architecture Notes":**
- **Schema Sharing**: Cập nhật danh sách schemas từ `libs/common/src/schemas/`
  - Format: "User, Tournament, Match, Team" (tên schema, không phải file)
- **NATS Patterns** (tùy chọn): Thêm section mới liệt kê message patterns theo service:
  ```
  - **NATS Message Patterns**:
    - `identity-service`: `auth.register`, `auth.login`, `user.findById`, `user.findByEmail`
    - `esports-service`: `tournaments.findAll`, `tournaments.create`, `tournaments.findById`, `matches.findByTournament`
  ```

### 4. Giữ nguyên các phần khác

**KHÔNG thay đổi:**
- Project Overview
- Requirements
- Installation
- Testing
- Code Conventions
- Contribution / PR Requirements
- Notes for AI Agents
- Cursor Workflows section

**CHỈ cập nhật:**
- Project Structure (cây thư mục)
- Running the Project (scripts)
- Build (scripts)
- Architecture Notes (schemas list, có thể thêm NATS patterns)

---

## Template cập nhật

### Project Structure

```markdown
## Project Structure

```
onlyquat-esport/
├── serve/                          # Main application directory
│   ├── apps/
│   │   ├── api-gateway/           # HTTP Gateway (Port 3000)
│   │   │   └── src/
│   │   ├── identity-service/      # Auth & Users (NATS only)
│   │   │   └── src/
│   │   ├── esports-service/       # Tournaments & Matches (NATS only)
│   │   │   └── src/
│   │   └── [thêm services khác nếu có]
│   ├── libs/
│   │   └── common/                # Shared library
│   │       └── src/
│   │           ├── database/      # DatabaseModule (MongoDB config)
│   │           ├── schemas/       # [Danh sách schemas từ thư mục]
│   │           └── dtos/         # [Danh sách DTOs từ thư mục]
│   ├── docker-compose.yml         # MongoDB, NATS, Redis
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
├── AGENTS.md                       # This file
└── README.md
```
```

### Running the Project

```markdown
### Running the Project

```bash
cd serve

# Start all services in development mode
pnpm run start:all

# Or start individually:
pnpm run start:dev:api-gateway       # HTTP on :3000
pnpm run start:dev:identity-service  # NATS only
pnpm run start:dev:esports-service   # NATS only
# [Thêm các service khác từ package.json]
```
```

### Build

```markdown
### Build

```bash
cd serve

# Build all apps
pnpm run build

# Build specific app
pnpm run build:api-gateway
pnpm run build:identity-service
pnpm run build:esports-service
# [Thêm các service khác từ package.json]
```
```

### Architecture Notes - Schema Sharing

```markdown
- **Schema Sharing**: All Mongoose schemas are in `libs/common/src/schemas`
  - Current schemas: [User, Tournament, Match, Team] (từ danh sách file .schema.ts)
  - Import using `MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])`
  - Services can use schemas from other services (e.g., `esports-service` uses `UserSchema`)
```

---

## Checklist

- [ ] Đã quét `serve/apps/` và lấy danh sách services
- [ ] Đã đọc `main.ts` của mỗi service để xác định HTTP/NATS-only
- [ ] Đã quét `serve/libs/common/src/schemas/` và lấy danh sách schemas
- [ ] Đã quét `serve/libs/common/src/dtos/` và lấy danh sách DTOs
- [ ] Đã đọc `package.json` và extract scripts
- [ ] Đã đọc controllers để lấy message patterns (tùy chọn)
- [ ] Đã cập nhật Project Structure với services hiện có
- [ ] Đã cập nhật Running the Project với scripts từ package.json
- [ ] Đã cập nhật Build với scripts từ package.json
- [ ] Đã cập nhật Architecture Notes với schemas hiện có
- [ ] Đã giữ nguyên các phần khác (không thay đổi)

---

## Lưu ý

- **Tự động hóa**: Command này nên được chạy mỗi khi:
  - Thêm service mới
  - Thêm schema/DTO mới
  - Thay đổi scripts trong package.json
- **Format**: Giữ format markdown nhất quán, indent đúng
- **Không xóa**: Không xóa các phần cố định (Overview, Requirements, v.v.)
