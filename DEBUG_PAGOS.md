# 🐛 Guía de Debugging - Sistema de Pagos

## 📋 Resumen del Problema

El usuario hace un pago en MercadoPago → Se redirige a `/pago/success` → La página muestra "Pendiente" aunque el pago ya está aprobado en la base de datos.

**Causa:** La página consulta la BD inmediatamente, pero el webhook de MercadoPago puede tardar unos segundos en actualizar el estado.

**Solución implementada:** Sistema de reintentos con polling (consulta cada 3 segundos durante 30 segundos).

---

## 🧪 Probar LOCALMENTE (sin gastar dinero)

### Opción 1: Simulador de Pago
1. Inicia el servidor: `npm run dev`
2. Ve a: `http://localhost:3000/test-pago`
3. Configura el delay (ej: 10 segundos)
4. Haz clic en "Iniciar Prueba de Pago"
5. Observa la consola del navegador (F12)

### Opción 2: Con modo Debug
1. Crea un pago de prueba en `/test-pago`
2. Cuando te redirija a success, agrega `&debug=true` a la URL:
   ```
   http://localhost:3000/pago/success?pago_id=xxx&debug=true
   ```
3. Verás un panel negro con todos los logs en tiempo real

---

## 🚀 Probar en PRODUCCIÓN (Vercel)

### Paso 1: Desplegar con debugging habilitado
```bash
git add .
git commit -m "Add payment debugging"
git push
```

### Paso 2: Hacer un pago real (mínimo)
1. Ve a tu sitio: `https://tu-sitio.vercel.app`
2. Haz un pago de prueba (el mínimo posible)
3. Cuando te redirija a la página de confirmación, **INMEDIATAMENTE**:
   - Abre la consola del navegador (F12 → Console)
   - Agrega `&debug=true` a la URL en la barra de direcciones
   - Presiona Enter

### Paso 3: Ver logs del cliente (navegador)
En la **consola del navegador** verás algo como:

```
[10:30:15] 📥 Parámetros recibidos - pago_id: abc123
[10:30:15] ⏳ Esperando 3 segundos para que el webhook procese el pago...
[10:30:18] 🔍 Consultando pago... (intento 1/11)
[10:30:18] ✅ Pago cargado, estado: pendiente
[10:30:18] ⏳ Pago aún pendiente, reintentando en 3 segundos...
[10:30:21] 🔍 Consultando pago... (intento 2/11)
[10:30:21] ✅ Pago cargado, estado: aprobado
[10:30:21] 🎉 ¡Pago aprobado detectado!
```

### Paso 4: Ver logs del servidor (webhook)
1. Ve a [Vercel Dashboard](https://vercel.com/)
2. Selecciona tu proyecto
3. Ve a la pestaña **"Logs"** o **"Runtime Logs"**
4. Busca logs del webhook:

```
🔔 MP Webhook received: {...}
💳 Payment notification for ID: 123456
✅ Payment updated successfully
💌 Enviando correo de agradecimiento...
```

**Alternativamente con Vercel CLI:**
```bash
vercel logs --follow
```

---

## 🔍 Qué buscar en los logs

### ✅ Comportamiento CORRECTO:

**Cliente (navegador):**
- Espera 3 segundos iniciales
- Consulta cada 3 segundos
- Detecta el cambio de "pendiente" a "aprobado" en 3-4 intentos
- Muestra UI verde con "¡Pago Exitoso!"

**Servidor (Vercel Logs):**
- Webhook recibe notificación de MercadoPago
- Consulta la API de MP para confirmar el estado
- Actualiza el pago a "aprobado" en Supabase
- Envía correo de agradecimiento

### ❌ Comportamiento INCORRECTO:

**Problema 1: Pago siempre queda pendiente**
```
[10:30:18] 🔍 Consultando pago... (intento 1/11)
[10:30:18] ✅ Pago cargado, estado: pendiente
...
[10:30:48] 🔍 Consultando pago... (intento 10/11)
[10:30:48] ✅ Pago cargado, estado: pendiente
[10:30:48] ⚠️ Se acabaron los reintentos. Estado final: pendiente
```
**Causa posible:** El webhook de MercadoPago NO está funcionando
**Solución:** Revisar logs del servidor (Vercel)

**Problema 2: Error consultando pago**
```
[10:30:18] ❌ Error consultando pago: [mensaje de error]
```
**Causa posible:** Error de conexión con Supabase
**Solución:** Verificar variables de entorno en Vercel

---

## 🛠️ Comandos útiles

### Ver logs en tiempo real (Vercel CLI)
```bash
vercel logs --follow
```

### Ver logs de una función específica
```bash
vercel logs --function api/mercadopago/webhook
```

### Ver logs de producción
```bash
vercel logs --prod
```

---

## 📊 Información adicional para debugging

### Parámetros que MercadoPago envía en la URL:
- `payment_id` o `external_reference` o `preference_id`
- `status` (success, pending, failure)
- `merchant_order_id`
- `collection_id`

### Estados posibles del pago en la BD:
- `pendiente` - Esperando confirmación de MercadoPago
- `aprobado` - Pago confirmado ✅
- `rechazado` - Pago rechazado por MP
- `cancelado` - Pago cancelado por el usuario

### Tiempos del sistema de reintentos:
- **Delay inicial:** 3 segundos
- **Intervalo entre reintentos:** 3 segundos
- **Máximo de reintentos:** 10
- **Tiempo total máximo:** ~33 segundos

---

## 🆘 Si todo falla

1. **Revisar el webhook de MercadoPago:**
   - Ve a [MercadoPago Developers](https://www.mercadopago.com.co/developers/panel)
   - Ve a "Webhooks" o "Notificaciones"
   - Verifica que la URL sea: `https://tu-sitio.vercel.app/api/mercadopago/webhook`
   - Verifica que esté activo

2. **Verificar variables de entorno en Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MERCADOPAGO_ACCESS_TOKEN`

3. **Probar el webhook manualmente:**
   - Copia un payload de ejemplo de los logs
   - Usa Postman o curl para enviar una petición POST al webhook
   - Verifica que actualice la BD correctamente

4. **Aumentar el tiempo de espera:**
   - Si 30 segundos no son suficientes, aumenta `MAX_RETRIES` en `src/app/pago/success/page.tsx`

---

## 📞 Contacto

Si después de todo esto el problema persiste, guarda:
1. Screenshots de los logs del navegador (con `?debug=true`)
2. Screenshots de los logs de Vercel
3. El `payment_id` del pago problemático
4. La hora exacta en que ocurrió

Esto ayudará a diagnosticar el problema específico.

