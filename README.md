# Fastify File Management API

Đây là dịch vụ backend tập trung cho việc upload và quản lý file/hình ảnh, sử dụng Cloudinary để lưu trữ, Prisma/Postgres để lưu metadata và Supabase để quản lý xác thực người dùng (JWT).

## Mục tiêu dự án
- Cung cấp API tập trung cho nhiều project/user để upload và quản lý file/hình ảnh.
- Cấp API key cho project/user để xác thực máy-máy; liên kết API key với folder riêng trên Cloudinary.
- Lưu metadata file (URL, publicId, kích thước, folder, owner, timestamps) trong PostgreSQL qua Prisma.
- Hỗ trợ CRUD cho file: upload, list (có phân trang), lấy theo id, đổi tên, xóa (một hoặc nhiều), xóa theo URL.

## Kiến trúc chính
- Fastify (TypeScript) làm HTTP server
- Prisma + PostgreSQL làm database và ORM
- Cloudinary lưu trữ file
- Supabase dùng cho đăng ký/verify JWT (user-facing flows)
- Swagger UI cho tài liệu API (khi server chạy: `/docs`)

## Cấu trúc thư mục chính
- `src/server.ts` — entrypoint khởi tạo Fastify và đăng ký plugin
- `src/router/index.ts` — đăng ký các router module (prefix `/api`)
- `src/module/<module>` — mỗi module gồm Repository / Service / Controller / Router
  - `src/module/file` — xử lý upload, CRUD file
  - `src/module/auth` — đăng ký, profile, API key
  - `src/module/user` — quản lý người dùng
- `src/base` — `api-reponse.ts`, `repository-base.ts` (BaseRepository chung)
- `src/config` — `prisma.ts`, `cloudinary.ts`, `supabaseClient.ts`, `swagger.ts`
- `src/middleware` — `apiAuth.ts` (X-API-Key), `auth.ts` (JWT/Supabase), `permissions.ts` (role checks)

## Biến môi trường cần thiết
Tạo file `.env` (hoặc thiết lập biến môi trường) với các biến sau:

- `DATABASE_URL` — chuỗi kết nối PostgreSQL (ví dụ: postgresql://USER:PASSWORD@HOST:PORT/DATABASE)
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `SUPABASE_URL` — URL Supabase (ví dụ https://xxxxx.supabase.co)
- `SUPABASE_ANON_KEY` — Supabase anon key (dùng để verify token)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (dùng cho admin operations)
- `CORS_ORIGIN` — (tuỳ chọn) origin cho CORS, mặc định `*`
- `NODE_ENV` — development | production

## Chạy dự án (dev)
1. Cài dependencies:

```powershell
npm install
```

2. Chạy ở chế độ dev (nodemon):

```powershell
npm run dev
```

Sau khi chạy, server mặc định lắng nghe port `3175` (có thể thay đổi trong `src/server.ts`).

## Build & chạy production

```powershell
npm run build
npm run start
```

## Tài liệu API
Mở `http://localhost:3175/docs` để xem Swagger UI (các route và schema đã được khai báo trong router).

## Các endpoint chính (tóm tắt)
- `POST /api/files/upload` — Upload nhiều file (multipart). Header `x-api-key` bắt buộc.
- `GET /api/files` — Lấy danh sách file theo folder với pagination. Header `x-api-key`.
- `GET /api/files/:id` — Lấy thông tin file theo id.
- `DELETE /api/files/:id` — Xóa file.
- `DELETE /api/files/bulk` — Xóa nhiều file cùng lúc (body chứa `fileIds`).
- `GET /api/files/folders` — Lấy danh sách folder của user.
- Auth endpoints (xem `src/module/auth` và Swagger): `/api/register`, `/api/profile`, `/api/profile (PUT)`, `/api/api-key`.

## Ví dụ sử dụng (PowerShell / Windows curl)

1) Upload file (multipart):

```powershell
curl -X POST "http://localhost:3175/api/files/upload" -H "x-api-key: YOUR_API_KEY" -F "files=@C:\path\to\image1.jpg" -F "files=@C:\path\to\image2.jpg" -F "folderName=images/project-photos"
```

2) Lấy danh sách file theo folder:

```powershell
curl -X GET "http://localhost:3175/api/files?folder=images&page=1&limit=20" -H "x-api-key: YOUR_API_KEY"
```

3) Lấy profile user bằng Bearer token (Supabase):

```powershell
curl -X GET "http://localhost:3175/api/profile" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Ghi chú kỹ thuật quan trọng
- `X-API-Key` được lưu trong bảng `users` (field `key`) và dùng để xác thực request liên quan tới file.
- Cloudinary folder format: `{userEmail}/{folderPath}`; folder được tạo tự động khi đăng ký hoặc khi upload lần đầu.
- `ApiResponse` (ở `src/base/api-reponse.ts`) dùng để chuẩn hoá tất cả response trả về: gồm `status`, `code`, `data`/`errors`, `message`, `timestamp`.
- `BaseRepository` là lớp wrapper cho Prisma (tại `src/base/repository-base.ts`) để dùng chung các phương thức CRUD.

## Vấn đề & lưu ý vận hành
- Hạn mức kích thước file: plugin multipart của Fastify giới hạn file tối đa 500MB trong cấu hình hiện tại; service sẽ validate tiếp theo type-specific rules.
- Khi Cloudinary gặp lỗi hoặc bị rate limit, upload sẽ trả lỗi tương ứng và service cố gắng không phá vỡ trạng thái DB.
- Cân nhắc giới hạn tần suất (rate limit) cho endpoint upload để tránh lạm dụng.

