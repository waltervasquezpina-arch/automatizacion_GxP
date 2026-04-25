# PLAN: Inyección de Inventario GxP

## Objetivo
Inyectar el JSON de inventario proporcionado en la aplicación, validar que la lógica de *forward‑fill* y la validación de datos funcionan y que el árbol de procesos se renderiza completo.

## Alcance
- Validar que el JSON es un array y que cada registro contiene al menos `Código Nivel 0` (o su equivalente).
- Utilizar la función `admin.injectBatch` con `autoNormalize=true`.
- Verificar que `deleteNode` nunca reciba `undefined` (garantizar array en `inv`).
- Mostrar toast de éxito y refrescar el árbol.
- Si ocurre error, registrar en consola y mostrar alerta.

## Pasos
1. **Preparación**
   - Añadir función `validateInventoryData` en `js/admin-manager.js` (ya implementada).
   - Asegurar que `deleteNode` inicializa `inv` con `[]` (ya implementado).
2. **UI**
   - Añadir botón **“🚀 Inyectar Manualmente”** en `admin-ingesta.html` que llama a `injectProcesado()`.
   - `injectProcesado()` parsea el JSON, llama a `validateInventoryData`, luego a `admin.injectBatch` y muestra toast.
3. **Prueba**
   - Copiar el JSON provisto al textarea `#json-input`.
   - Pulsar el nuevo botón.
   - Verificar que el árbol muestra todas las ramas de `E.01` (niveles 0‑3).
   - Confirmar que no aparecen errores `Cannot read properties of undefined (reading 'filter')`.
4. **Validación**
   - Abrir consola del navegador y buscar `filter` errores.
   - Si todo correcto, usar el botón **“💾 Backup Maestro”** para generar archivo semilla.

## Criterios de aceptación
- El árbol muestra al menos los nodos `E.01.01`, `E.01.01.01`, `E.01.01.02`, `E.01.01.02.01`, `E.01.01.02.02`, etc.
- Aparece toast verde con mensaje "¡Datos inyectados exitosamente!".
- No aparecen errores en consola relacionados con `filter`.
- El backup maestro contiene los datos inyectados.

## Dependencias
- `js/admin-manager.js`
- `admin-ingesta.html`
- `js/storage.js` (para persistencia).

## Próximos pasos (post‑prueba)
- Si la inyección es exitosa, proceder a migrar a base de datos persistente.
- Añadir pruebas unitarias para `validateInventoryData` y `injectBatch`.
