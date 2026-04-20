# Instrucciones: Automatización y Sistematización para la Generación de Fichas de Productos y Procesos (Fase de Prototipado)

## 1. Objetivos

**Objetivo General:**
Desarrollar e implementar un aplicativo prototipo funcional (MVP) centrado en la gestión estructurada (operaciones CRUD) de los datos correspondientes a las Fichas de Productos y Procesos. Este sistema busca automatizar la generación de los documentos formales, eliminando el registro manual y los errores de formato, garantizando el cumplimiento de la normativa de la Secretaría de Gestión Pública (SGP-PCM).

**Objetivos Específicos:**
* **1.1. Automatización Documental:** Lograr que, tras el registro de los datos, el sistema inyecte esta información en plantillas predefinidas, generando documentos finales íntegros sin alterar el formato original.
* **1.2. Sistematización de Codificación:** Mitigar el riesgo de error humano mediante la asignación y correlación automática de la codificación de los procesos dentro del sistema.
* **1.3. Herencia de Datos Estructurales:** Implementar un mecanismo de herencia jerárquica que permita trasladar automáticamente campos transversales registrados en un proceso padre (como "Requisitos normativos" u "Objetivos estratégicos") hacia sus procesos derivados (nivel 1 a más).
* **1.4. Integración de Cerebro IA para Procesamiento Dinámico:** Integrar capacidades de inteligencia artificial generativa mediante el consumo de la API de LM Studio, actuando como el motor lógico del aplicativo. Esta IA no solo asistirá al usuario en la redacción de campos complejos (Riesgos, Registros), sino que tendrá la capacidad de ingerir, procesar y estructurar dinámicamente los datos crudos desde los documentos fuente (Excel, PDF) hacia el formato JSON, garantizando tolerancia a cambios y actualizaciones durante las fases de levantamiento de información.

## 2. Finalidad
Optimizar la gestión del tiempo y los recursos de los especialistas de modernización, trasladando el esfuerzo operativo hacia una plataforma tecnológica. Con esto, se busca que la entidad concentre sus esfuerzos en el análisis de valor público y la mejora continua, asegurando la estandarización, trazabilidad y el estricto cumplimiento de los lineamientos de la Norma Técnica N° 002-2025-PCM/SGP para la Gestión por Procesos.

## 3. Arquitectura y Stack Tecnológico (Fase de Prototipado)
Para asegurar un desarrollo ágil, escalable y de bajo costo en esta fase inicial, el aplicativo se construirá bajo la siguiente arquitectura:
* **Frontend (Interfaz de Usuario):** Desarrollo basado en HTML5 y Vanilla JavaScript (sin frameworks pesados), garantizando alta velocidad y compatibilidad. Para el diseño visual, se utilizará CSS3 bajo la metodología BEM (Block, Element, Modifier), asegurando componentes modulares, reutilizables y un código limpio.
* **Motor de Base de Datos:** Se empleará `localStorage` del navegador web como motor de persistencia temporal de datos. Toda la información (inventarios, macroprocesos y relaciones jerárquicas) será serializada y almacenada estrictamente en formato JSON, preparando el terreno para una futura migración a bases de datos NoSQL o relacionales.
* **Capa de Inteligencia Artificial:** Se implementará una conexión vía API a LM Studio, permitiendo acceder a Modelos de Lenguaje (LLMs) de forma remota. Esta capa tecnológica será el motor de asistencia cognitiva para sugerir o validar campos complejos en las fichas, así como para la ingesta dinámica de documentos.

## 4. Metodología de Implementación
El despliegue del prototipo y la generación documental seguirá las siguientes fases técnicas:

* **Fase 1: Módulo de Ingesta y Transformación Dinámica:** Desarrollar en el aplicativo una interfaz que permita la carga de los documentos fuente actualizados (Documentos necesarios: 1. "Inventario de Procesos" y el 2. "Mapa de Procesos Institucional"). Mediante rutinas de JavaScript y llamadas a la API del "Cerebro IA", el sistema extraerá, validará y convertirá el contenido de estos archivos a arreglos y objetos JSON en tiempo real, almacenándolos en el `localStorage`. Esto elimina la dependencia de bases de datos pre-generadas estáticamente.
* **Fase 2: Arquitectura de Directorios:** Ejecutar rutinas automatizadas para crear la estructura jerárquica de carpetas de almacenamiento (ej. en Google Drive) a partir de los procesos estratégicos de Nivel 0 identificados dinámicamente.
* **Fase 3: Consolidación Inteligente del Nivel 0:** El aplicativo procesará el documento "Mapa de Procesos Institucional" actualizado, y utilizando el Cerebro IA, estructurará la totalidad de las Fichas de Nivel 0. Estos objetos JSON dinámicos actuarán como la "raíz" segura para la herencia de datos hacia los subprocesos, permitiendo recalcular la herencia si el Mapa sufre modificaciones.
* **Fase 4: Generación Documental Asistida:** Mediante las funciones en Vanilla JavaScript y la conexión a la API de LM Studio, el aplicativo asistirá en el llenado de las "Fichas de Producto y Proceso" derivadas. Finalmente, un motor de plantillas fusionará estos datos JSON con los formatos documentales oficiales para su posterior descarga o aprobación.

## 5. Repositorio Documental y Contextualización (Capa de Verdad)
Para garantizar el estricto alineamiento del prototipo con la realidad institucional y la normativa vigente, se ha estructurado un directorio raíz denominado `document\`. Este repositorio funciona como la base de conocimiento estático y fuente de consulta obligatoria para el procesamiento de datos y la configuración del contexto de los Modelos de Lenguaje (LLMs) ejecutados vía LM Studio. Los documentos integrados en esta carpeta son:

* **Normativa y Estandarización:** La Norma Técnica N° 002-2025-PCM/SGP y sus anexos (específicamente el Anexo 2), junto con la "Guía de Registro de Fichas de Producto y Procesos", proveen las reglas de validación sintáctica, la estructura obligatoria y las directrices para la correcta formulación de objetivos y requisitos normativos.
* **Identidad Organizacional:** El Manual de Operaciones (MOP) actúa como el diccionario de datos maestro para asegurar que la denominación de todas las unidades orgánicas y funcionales dentro del aplicativo coincida estrictamente con la estructura aprobada por la institución.
* **Arquitectura de Procesos:** El "Mapa de Procesos Institucional Nivel 0" y las matrices del "Inventario de Procesos" proporcionan la jerarquía lógica, los códigos base y la relación de productos oficiales, permitiendo parametrizar el árbol de herencia de datos desde el macroproceso hasta los procedimientos operativos.

La integración técnica de este directorio asegura que el aplicativo y sus módulos de asistencia inteligente procesen la información bajo un marco institucional seguro, estandarizado y libre de desviaciones funcionales.