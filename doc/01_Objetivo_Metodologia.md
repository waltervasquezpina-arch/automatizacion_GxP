# Objetivo y Metodología: AGROIDEAS GxP

## 🏛️ Propósito del Sistema
El sistema GxP nace para resolver el **problema público** de la desarticulación en la gestión por procesos dentro de AGROIDEAS. Su valor institucional radica en garantizar la integridad, estandarización y explotación del conocimiento organizacional.
*   **Soberanía de Datos:** Centralizar el conocimiento técnico que históricamente reside en archivos aislados, convirtiéndolo en un activo institucional.
*   **Transparencia:** Asegurar que cada actividad esté alineada a la normativa vigente y sea fácilmente auditable.
*   **Eficiencia Operativa:** Reducir drásticamente la brecha de error humano y el tiempo de redacción de documentos técnicos mediante el uso de Inteligencia Artificial.

## 🎯 Alcance y Límites
### **Alcance (Lo que el sistema HACE):**
*   **Gestión de Inventario:** Normalización y jerarquización de procesos desde el Nivel 0 al 4.
*   **Asistencia de Caracterización:** Generación asistida por IA de modelos SIPOC y fichas técnicas.
*   **Exportación Normativa:** Creación automática de expedientes en formatos institucionales (Word/JSON).
*   **Persistencia Local:** Control total del usuario sobre sus datos mediante sistemas de Backup Maestro.

### **Límites (Lo que el sistema NO HACE):**
*   No reemplaza los sistemas de trámite documentario (SGD) institucionales.
*   No realiza aprobaciones automáticas; la validación final es responsabilidad exclusiva de los dueños de procesos.
*   No gestiona ejecución presupuestal ni indicadores financieros.

## ⚙️ Metodología de Desarrollo
Se utiliza un enfoque de **Ciclos Iterativos Rápidos (VibeCoding)**, alineado con las directivas de modernización de la **Secretaría de Gestión Pública (SGP-PCM)**. El desarrollo se divide en 4 fases progresivas:

1.  **Fase 1: Ingesta y Normalización:** Captura de datos heterogéneos y aplicación de lógica de "Forward Fill".
2.  **Fase 2: Arquitectura de Directorios:** Transformación de datos planos en estructuras jerárquicas navegables.
3.  **Fase 3: Consolidación (Completado):** Establecimiento del archivo `inventario_maestro.json` como única fuente de verdad (Seed File).
4.  **Fase 4: Explotación e IA (En Ejecución):** Implementación de IA Brain PRO para la redacción y validación GxP.

## 👥 Roles del Equipo
*   **Desarrollo y Automatización:** Agentes de IA y Especialista en Desarrollo de Sistemas.
*   **Análisis y Calidad GxP:** Especialistas de la Unidad de Planeamiento y Presupuesto (UPP) encargados de validar la lógica técnica.
*   **Aprobadores:** Jefatura de la UPP y Dirección Ejecutiva, responsables de oficializar los procesos sistematizados.
