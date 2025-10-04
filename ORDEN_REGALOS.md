# 🎁 Cómo Cambiar el Orden de los Regalos

## 📋 Resumen
Ahora puedes controlar manualmente el orden en que aparecen los regalos en tu página. Los regalos se ordenan por el campo `orden` (número menor = aparece primero).

---

## 🚀 Pasos para Cambiar el Orden

### 1️⃣ Aplicar la migración a Supabase

Ejecuta este comando en tu terminal:

```bash
npx supabase db push
```

Esto creará la nueva columna `orden` en la tabla `productos` y asignará valores iniciales basados en el orden actual.

---

### 2️⃣ Cambiar el orden desde Supabase Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Table Editor** → **productos**
4. Verás la nueva columna **orden** con números (1, 2, 3, 4, etc.)

### 3️⃣ Editar el orden

**Para cambiar el orden:**
- Haz clic en la celda de la columna `orden`
- Cambia el número
- Presiona Enter o haz clic fuera de la celda para guardar

**Ejemplos:**

| Regalo | Orden Actual | Nuevo Orden | Resultado |
|--------|--------------|-------------|-----------|
| Luna de miel | 1 | 1 | Aparece primero |
| Electrodomésticos | 2 | 3 | Aparece tercero |
| Muebles | 3 | 2 | Aparece segundo |
| Decoración | 4 | 4 | Aparece cuarto |

**Reglas:**
- ✅ Número más bajo = aparece primero
- ✅ Puedes usar cualquier número entero
- ✅ Puedes dejar espacios entre números (ej: 10, 20, 30) para insertar después
- ❌ No puedes dejar el campo vacío (debe tener un número)

---

### 4️⃣ Ver los cambios

1. Guarda los cambios en Supabase
2. Recarga tu página de regalos: `https://matrimonio-gafas.vercel.app/regalos`
3. Los regalos aparecerán en el nuevo orden

**No necesitas redesplegar la app**, los cambios son instantáneos.

---

## 💡 Consejos

### Estrategia de numeración recomendada:

**Opción 1: Números consecutivos**
```
1, 2, 3, 4, 5...
```
- Simple y directo
- Tienes que renumerar si insertas algo en medio

**Opción 2: Números con espacios**
```
10, 20, 30, 40, 50...
```
- Puedes insertar entre medio sin renumerar todo
- Ejemplo: si quieres meter algo entre 10 y 20, usas 15

**Opción 3: Por categorías**
```
100-199: Viajes
200-299: Casa
300-399: Experiencias
```
- Agrupa regalos similares
- Facilita la organización

---

## 🔧 Comandos Útiles

### Ver el orden actual (SQL):
```sql
SELECT titulo, orden 
FROM productos 
ORDER BY orden;
```

### Reorganizar todo de una vez (SQL):
```sql
-- Ejemplo: Luna de miel primero, luego Muebles, luego Electrodomésticos
UPDATE productos SET orden = 1 WHERE titulo = 'Luna de miel en Cartagena';
UPDATE productos SET orden = 2 WHERE titulo = 'Muebles para el apartamento';
UPDATE productos SET orden = 3 WHERE titulo = 'Electrodomésticos';
```

---

## 🎯 Ejemplo de Uso

**Objetivo:** Quieres que "Luna de miel" aparezca primero porque es el regalo más importante.

**Pasos:**
1. Ve a Supabase → Table Editor → productos
2. Encuentra "Luna de miel en Cartagena"
3. Cambia su `orden` a `1`
4. Guarda
5. ¡Listo! Ya aparece primero en la página

---

## ❓ Preguntas Frecuentes

**¿Qué pasa si dos regalos tienen el mismo número de orden?**
- Supabase usará `created_at` como segundo criterio de orden

**¿Puedo usar números negativos?**
- Sí, pero no es recomendado. Mejor usa números positivos.

**¿Cuál es el número máximo?**
- Hasta 2,147,483,647 (límite de INTEGER en PostgreSQL)

**¿Los invitados ven los números?**
- No, solo tú los ves en el admin. Los invitados solo ven los regalos en orden.

---

## 🚨 Nota Importante

Después de aplicar la migración (`npx supabase db push`), los regalos tendrán el orden actual basado en su fecha de creación. Puedes cambiarlos desde ese momento cuando quieras.

