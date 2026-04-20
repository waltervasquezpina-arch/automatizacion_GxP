# Flujos de Eventos y Secuencias Técnicas

## 1. Ciclo de Vida del Aplicativo (Bootstrap)
Describe el proceso que ocurre cada vez que el usuario abre cualquier página del sistema.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant H as HTML (Página)
    participant S as Storage (db)
    participant J as JSON Maestro

    U->>H: Abre página
    H->>S: DOMContentLoaded -> db.bootstrap()
    S->>S: ¿Tiene datos en LocalStorage?
    alt No hay datos
        S->>J: Fetch datos/inventario_maestro.json
        J-->>S: Retorna Objeto JSON
        S->>S: Guarda en LocalStorage (Nivel 0 + Mayo)
        S-->>H: Bootstrap Éxito
    else Hay datos
        S-->>H: Retorna true inmediatamente
    end
    H->>H: Renderiza UI (CoreEngine.buildTree)
```

## 2. Flujo de Inyección de Datos (Batch Injection)
Describe el proceso de validación y limpieza durante la carga masiva.

```mermaid
graph LR
    A[JSON Externo] --> B{Validación CoreEngine}
    B -- No GxP --> C[Rechazo / Error]
    B -- Válido --> D[Sanitización XSS]
    D --> E[Normalización de Campos]
    E --> F[Persistencia LocalStorage]
    F --> G[Refresco Visual Árbol]
```

## 3. Generación de Estructura Local (ZIP)
Describe cómo se transforma el inventario en un archivo descargable.
1. **Trigger:** Usuario pulsa "Descargar Estructura Local (.zip)".
2. **Reconstrucción:** El `CoreEngine` construye el objeto jerárquico recursivo.
3. **Compresión:** `JSZip` itera por cada nivel creando carpetas virtuales.
4. **Exportación:** Se inyecta un archivo `INFO.txt` en cada nodo hoja para evitar carpetas vacías y se sirve el Blob al navegador.
