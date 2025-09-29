# 📧 Configuración de Correos de Agradecimiento

## ✅ Lo que ya está implementado:

1. **Sistema de correos**: Configurado con Gmail SMTP usando nodemailer
2. **Plantilla de correo**: Hermosa plantilla HTML personalizada para Jaime y Alejandra (Los Gafufos)
3. **Integración con webhook**: Envío automático cuando MercadoPago aprueba un pago
4. **Campo email**: Agregado a la tabla `pagos` para almacenar emails de contribuyentes
5. **Endpoint de prueba**: `/api/test-email` para probar el sistema

## 🛠️ Pasos para configurar Gmail:

### 1. Configurar Gmail para aplicaciones

1. Ve a tu cuenta de Gmail (la que quieres usar para enviar)
2. Activa la **verificación en 2 pasos** si no la tienes:
   - Configuración → Seguridad → Verificación en 2 pasos
3. Genera una **contraseña de aplicación**:
   - Configuración → Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" como aplicación
   - Copia la contraseña de 16 caracteres que te genera

### 2. Agregar variables al archivo `.env.local`

Agrega estas líneas a tu archivo `.env.local` (reemplaza con tus datos):

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion-de-16-caracteres
SMTP_FROM_NAME=Jaime y Alejandra (Los Gafufos)
SMTP_FROM_EMAIL=tu-email@gmail.com
```

### 3. Aplicar migración de base de datos

Ejecuta la migración para agregar el campo email:

```bash
# Si usas Supabase CLI
supabase db push

# O ejecuta manualmente en tu base de datos:
# supabase/migrations/013_add_email_to_pagos.sql
```

## 🧪 Cómo probar el sistema:

### 1. Probar envío de correo directamente:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "quien_regala": "María García",
    "email_contribuyente": "maria@example.com",
    "producto_titulo": "Luna de Miel en París",
    "monto": 150000,
    "mensaje": "¡Que sean muy felices!"
  }'
```

### 2. Probar flujo completo:
1. Ve a la página de regalos
2. Haz una contribución con un email válido
3. Completa el pago en MercadoPago (modo sandbox)
4. El correo se enviará automáticamente cuando el pago sea aprobado

## 📧 Características del correo:

- **Diseño hermoso**: Plantilla HTML con gradientes románticos
- **Personalizado**: Menciona "Los Gafufos" como les dicen
- **Completo**: Incluye todos los detalles del regalo y contribución
- **Responsive**: Se ve bien en móviles y desktop
- **Copia oculta**: Los novios reciben una copia de cada correo enviado

## 🔧 Flujo técnico:

1. Usuario hace contribución → se guarda email en tabla `pagos`
2. MercadoPago procesa pago → envía webhook
3. Webhook actualiza estado a 'aprobado' → dispara envío de correo
4. Sistema envía correo personalizado al contribuyente
5. Los novios reciben copia oculta (BCC)

## 🚨 Notas importantes:

- Los correos solo se envían cuando el pago es **aprobado**
- Si no hay email del contribuyente, el correo se envía solo a los novios
- El sistema no falla si hay error en el email (no afecta el webhook)
- Todos los logs aparecen en la consola para debugging

## 📁 Archivos modificados:

- `src/lib/email.ts` - Servicio de correos
- `src/app/api/mercadopago/webhook/route.ts` - Integración con webhook
- `src/components/ContribucionModal.tsx` - Captura de email
- `src/types/index.ts` - Tipos TypeScript actualizados
- `supabase/migrations/013_add_email_to_pagos.sql` - Nueva migración
- `src/app/api/test-email/route.ts` - Endpoint de prueba

¡El sistema está listo! Solo falta configurar las variables de entorno y aplicar la migración. 🎉
