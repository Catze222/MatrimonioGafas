# Wedding App Database Schema

## Tables Overview

### `invitados` - Wedding Guests
Stores information about wedding guests and their RSVP status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| slug | TEXT | UNIQUE, NOT NULL | URL-friendly unique identifier for guest access |
| nombre_1 | TEXT | NOT NULL | First person's name |
| nombre_2 | TEXT | NULLABLE | Second person's name (for couples) |
| foto_url | TEXT | NULLABLE | Profile photo URL from Supabase Storage |
| asistencia_1 | TEXT | DEFAULT 'pendiente', CHECK | RSVP status for first person |
| asistencia_2 | TEXT | DEFAULT 'pendiente', CHECK | RSVP status for second person |
| restriccion_1 | TEXT | NULLABLE | Dietary restrictions for first person |
| restriccion_2 | TEXT | NULLABLE | Dietary restrictions for second person |
| mensaje | TEXT | NULLABLE | Optional message from guests to couple |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Enums:**
- `asistencia_1`, `asistencia_2`: 'pendiente' | 'si' | 'no'

**Indexes:**
- `idx_invitados_slug` ON slug

### `productos` - Gift Products
Catalog of symbolic gifts that guests can contribute to.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| titulo | TEXT | NOT NULL | Gift title/name |
| descripcion | TEXT | NOT NULL | Gift description |
| imagen_url | TEXT | NOT NULL | Product image URL from Supabase Storage |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### `pagos` - Gift Payments
Records of guest contributions to gift products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| producto_id | UUID | NOT NULL, FK to productos.id | Reference to gift product |
| quien_regala | TEXT | NOT NULL | Name of person giving the gift |
| mensaje | TEXT | NULLABLE | Optional message to the couple |
| monto | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Amount contributed |
| estado | TEXT | DEFAULT 'pendiente', CHECK | Payment status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Enums:**
- `estado`: 'pendiente' | 'aprobado' | 'rechazado'

**Indexes:**
- `idx_pagos_producto_id` ON producto_id
- `idx_pagos_estado` ON estado

**Foreign Keys:**
- `producto_id` → `productos.id` (CASCADE DELETE)

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Public Access (Guests)
- **Read access**: All guests can read all tables
- **RSVP updates**: Guests can update their own invitado record
- **Gift payments**: Anyone can create new payment records

### Admin Access
- Admin operations use service role key which bypasses RLS
- Full CRUD access through admin panel

## Storage

### Buckets
- `avatars` - Guest profile photos
- `productos` - Gift product images

Both buckets allow public read access and authenticated upload.

## Triggers

### `update_invitados_updated_at`
Automatically updates the `updated_at` field when an invitado record is modified.

---

**Last Updated:** Initial creation
**Migration:** 001_create_wedding_tables.sql
