# AGROIDEAS GxP: Automatización Documental e Inventario

## 1. Objetivo
Desarrollar una plataforma centralizada para la gestión, normalización y explotación del Inventario de Procesos de AGROIDEAS. El sistema busca asegurar la integridad de los datos institucionales (GxP) y facilitar la generación automática de documentación técnica de procesos.

## 2. Finalidad
Reducir la brecha de error humano en la catalogación de procesos y agilizar la arquitectura de directorios institucionales, proporcionando una base de datos sólida para la futura generación de fichas técnicas mediante Inteligencia Artificial.

## 3. Metodología de Trabajo
Se ha implementado una metodología de 4 fases progresivas:

### Fase 1: Ingesta y Normalización
- Captura de datos desde fuentes heterogéneas (PDF, Excel, Gemini).
- Aplicación de lógica de "Forward Fill" para herencia jerárquica.
- Limpieza y sanitización de caracteres Especiales.

### Fase 2: Arquitectura de Directorios
- Transformación del inventario plano en una estructura jerárquica (Nivel 0 al 4).
- Generación de scripts para Google Drive y descarga local en formato ZIP.

### Fase 3: Consolidación y Fuente Única
- Eliminación de redundancias de datos.
- Establecimiento del archivo `inventario_maestro.json` como única fuente de verdad.
- Implementación de un Core Engine central para toda la lógica de negocio.

### Fase 4: Explotación y Generación (En Proceso)
- Redacción de fichas técnicas asistida por IA.
- Control de riesgos y puntos críticos institucionales.
