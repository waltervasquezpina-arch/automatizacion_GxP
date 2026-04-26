# AGROIDEAS GxP: Automatización de Procesos e Inteligencia Documental

## 📝 Descripción Breve
Este aplicativo es un ecosistema **Local-First** diseñado para la normalización, gestión y explotación del Inventario de Procesos de AGROIDEAS. Resuelve el problema de la fragmentación de datos institucionales y el error humano en la creación de fichas técnicas, automatizando la generación de documentos bajo la **Norma Técnica N° 002-2025-PCM/SGP** del MIDAGRI.

## 📂 Estructura de la Documentación
Para una comprensión profunda del sistema y su metodología, consulte los siguientes documentos técnicos:
*   [01. Objetivo y Metodología](doc/01_Objetivo_Metodologia.md): Detalle de las 4 fases de desarrollo y visión estratégica.
*   [02. Arquitectura y Stack](doc/02_Arquitectura_Stack.md): Componentes técnicos, estructura de archivos y flujo de datos.
*   [03. Diccionario de Datos](doc/03_Diccionario_Datos.md): Estructura detallada del Inventario Maestro, Fichas y lógica de herencia.
*   [04. Flujos de Eventos](doc/04_Flujos_Eventos.md): Diagramas de secuencia de bootstrap, ingesta y backup.

## ⚙️ Instalación y Configuración Local
Al ser una aplicación basada en tecnologías web estándar y persistencia local, el despliegue es inmediato:
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/waltervasquezpina-arch/automatizacion_GxP.git
    ```
2.  **Servidor Local (Recomendado):**
    Para habilitar correctamente las funciones de IA (CORS) y Fetch de datos, se recomienda usar un servidor local. Puede usar la extensión **Live Server** de VS Code o ejecutar:
    ```bash
    npx serve .
    ```
3.  **Configuración de IA:**
    En el Dashboard (`index.html`), haga clic en el botón de **⚙️ Ajustes** en la tarjeta "IA Brain PRO" para configurar su API Key de Gemini o su token de LM Studio.

## 🛠️ Tecnologías Principales
*   **Lógica:** JavaScript ES6+ (Vanilla / Programación Orientada a Objetos).
*   **Persistencia:** LocalStorage Engine con motor de Backup Maestro para archivos semilla.
*   **Diseño:** CSS3 Moderno (Glassmorphism, Variables CSS, Diseño Responsive).
*   **IA:** Motores integrados para Google Gemini Pro y LM Studio (Inferencia Local).
*   **Exportación:** JSZip (Estructuras de carpetas) y Docx.js (Documentos Word institucionales).

---
© 2025 AGROIDEAS - Oficina de Planeamiento y Presupuesto.
