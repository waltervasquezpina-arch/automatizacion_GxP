/**
 * export-engine.js
 * Generador de archivos Word (.docx) y Google Docs compatible para Fichas GxP.
 */

const exportEngine = {
    /**
     * Genera un archivo .docx profesional inyectando datos en la plantilla institucional.
     */
    async toWordFromTemplate(ficha) {
        try {
            // 1. Cargar el archivo de plantilla como binario
            const response = await fetch('plantilla/Generación de FPP 1 - 4_  Plantilla valores.docx');
            if (!response.ok) throw new Error("No se pudo cargar la plantilla Word en 'plantilla/'.");
            
            const content = await response.arrayBuffer();
            // CORRECCIÓN FINAL: Detección robusta del constructor en diferentes CDNs
            const PizZipConstructor = window.PizZip || (typeof PizZip !== 'undefined' ? PizZip : null);
            if (!PizZipConstructor) throw new Error("La librería PizZip no se cargó correctamente.");
            
            const zip = new PizZipConstructor(content);
            
            // 2. Inicializar docxtemplater
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // 3. Preparar los datos para la plantilla (Standard v1-2026)
            // Agregamos flags adicionales para facilitar el uso en Word
            const dataToInject = {
                ...ficha,
                hasSipoc: ficha.sipoc && ficha.sipoc.length > 0,
                hasNormas: ficha.requisitosNormativos && ficha.requisitosNormativos.length > 0,
                normas: ficha.requisitosNormativos ? ficha.requisitosNormativos.map(n => ({ nombre: n })) : [],
                fechaGeneracion: new Date().toLocaleDateString()
            };

            // 4. Inyectar datos y renderizar
            doc.render(dataToInject);

            // 5. Generar el documento final
            const out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            // 6. Descargar el archivo
            saveAs(out, `Ficha_GxP_${ficha.codigo || 'S-N'}_Digital.docx`);
            console.log("✅ Documento digital generado con éxito desde plantilla.");

        } catch (error) {
            console.error("❌ Error en Generación Digital:", error);
            
            let detalle = error.message;
            // Si es un Multi error de docxtemplater, extraemos el detalle exacto
            if (error.properties && error.properties.errors) {
                detalle = "Reporte de Errores Múltiples:\n\n" + error.properties.errors.map((e, i) => `${i+1}. Problema: ${e.message}\n   Causa: ${e.name}\n   Etiqueta Afectada (Si aplica): ${e.properties && e.properties.id ? e.properties.id : 'N/A'}`).join("\n\n");
            }

            // Usar el nuevo modal en lugar del alert nativo
            this.showErrorModal(
                "Error de Formato en la Plantilla Word",
                "El sistema procedió con la descarga de emergencia (formato básico) porque la plantilla institucional tiene errores de sintaxis en las etiquetas.<br><br><b>💡 SOLUCIÓN:</b> Busca en tu documento Word si has puesto triples llaves <code>{{{</code> o llaves separadas <code>{{ {{</code>.",
                detalle
            );
            
            this.toWordBasic(ficha);
        }
    },

    /**
     * Muestra un modal elegante y amplio para leer errores técnicos largos.
     */
    showErrorModal(title, message, details) {
        let modal = document.getElementById('gxp-error-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'gxp-error-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.7); backdrop-filter:blur(5px); z-index:9999; display:flex; align-items:center; justify-content:center;';
            
            const content = document.createElement('div');
            content.style.cssText = 'background:white; padding:2.5rem; border-radius:16px; width:90%; max-width:800px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; max-height:90vh;';
            
            content.innerHTML = `
                <h2 style="color:#b91c1c; margin-bottom:1rem; display:flex; align-items:center; gap:10px; font-size:1.5rem;">⚠️ <span id="gem-title-text"></span></h2>
                <p id="gem-message" style="margin-bottom:1.5rem; font-size:0.95rem; color:#334155; line-height:1.5;"></p>
                <div style="flex:1; display:flex; flex-direction:column; min-height:250px;">
                    <label style="font-weight:700; font-size:0.85rem; color:#64748b; margin-bottom:0.5rem; text-transform:uppercase;">Registro Técnico del Error:</label>
                    <textarea id="gem-details" style="flex:1; width:100%; padding:1.25rem; font-family:monospace; font-size:0.85rem; border:2px solid #e2e8f0; border-radius:8px; background:#f8fafc; resize:vertical; color:#0f172a; line-height:1.4;" readonly></textarea>
                </div>
                <div style="margin-top:2rem; text-align:right;">
                    <button onclick="document.getElementById('gxp-error-modal').style.display='none'" style="padding:0.75rem 2rem; background:#004d3d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.95rem; transition:all 0.2s;">Entendido</button>
                </div>
            `;
            modal.appendChild(content);
            document.body.appendChild(modal);
        }
        
        document.getElementById('gem-title-text').textContent = title;
        document.getElementById('gem-message').innerHTML = message;
        document.getElementById('gem-details').value = details;
        modal.style.display = 'flex';
    },

    /**
     * Generador básico (Fallback) en caso de que la plantilla no esté disponible.
     */
    toWordBasic(ficha) {
        const title = ficha.nombre || "Ficha_GxP";
        const content = this.generateGxPHtml(ficha);
        
        const blob = new Blob(['\ufeff', content], {
            type: 'application/msword'
        });
        
        saveAs(blob, `Ficha_GxP_${ficha.codigo || 'S-N'}.doc`);
    },

    /**
     * Genera el HTML estructurado con el Estándar GxP v1-2026.
     */
    generateGxPHtml(data) {
        const sipoc = data.sipoc || [];
        const normas = data.requisitosNormativos || [];
        
        return `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Ficha GxP v1-2026</title>
        <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.2; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 9pt; word-wrap: break-word; }
            th { background-color: #f2f2f2; text-align: left; font-weight: bold; width: 25%; }
            .header-table { border: none; }
            .header-table td { border: none; text-align: center; font-weight: bold; font-size: 12pt; color: #004d3d; }
            .section-title { background-color: #004d3d; color: white; font-weight: bold; padding: 6px; text-align: center; font-size: 10pt; }
            .label-cell { background-color: #f8f9fa; font-weight: bold; }
        </style>
        </head>
        <body>
            <table class="header-table">
                <tr><td>FICHA DE CARACTERIZACIÓN DE PRODUCTOS Y PROCESOS</td></tr>
                <tr><td style="font-size: 8pt; color: #666;">Standard GxP-AGROIDEAS v.01-2026</td></tr>
            </table>
            
            <table>
                <tr><th colspan="4" class="section-title">1. INFORMACIÓN GENERAL</th></tr>
                <tr><th class="label-cell">Código:</th><td>${data.codigo || ''}</td><th class="label-cell">Versión:</th><td>${data.version || '01'}</td></tr>
                <tr><th class="label-cell">Nombre:</th><td colspan="3">${data.nombre || ''}</td></tr>
                <tr><th class="label-cell">Tipo de Proceso:</th><td colspan="3">${data.tipoProceso || ''}</td></tr>
                <tr><th class="label-cell">Dueño del Proceso:</th><td colspan="3">${data.duenoProceso || ''}</td></tr>
                <tr><th class="label-cell">Objetivo del Proceso:</th><td colspan="3">${data.objetivoProceso || ''}</td></tr>
                <tr><th class="label-cell">Objetivo Estratégico:</th><td colspan="3">${data.objetivoEstrategico || ''}</td></tr>
            </table>

            <table>
                <tr><th colspan="1" class="section-title">2. REQUISITOS NORMATIVOS</th></tr>
                ${normas.map(n => `<tr><td>${n}</td></tr>`).join('')}
                ${normas.length === 0 ? '<tr><td>No especificado</td></tr>' : ''}
            </table>

            <table>
                <tr><th colspan="5" class="section-title">3. DESCRIPCIÓN DEL PROCESO (SIPOC)</th></tr>
                <tr style="background-color: #f2f2f2;">
                    <th>Proveedor</th>
                    <th>Entrada</th>
                    <th>Proceso</th>
                    <th>Producto</th>
                    <th>Receptor</th>
                </tr>
                ${sipoc.map(row => `
                    <tr>
                        <td>${row.proveedor || ''}</td>
                        <td>${row.entrada || ''}</td>
                        <td style="font-weight:bold;">${row.proceso || ''}</td>
                        <td>${row.producto || ''}</td>
                        <td>${row.receptor || ''}</td>
                    </tr>
                `).join('')}
            </table>

            <table>
                <tr><th colspan="2" class="section-title">4. OTROS ELEMENTOS</th></tr>
                <tr><th class="label-cell">Riesgos:</th><td>${data.riesgos || ''}</td></tr>
                <tr><th class="label-cell">Registros:</th><td>${data.registros || ''}</td></tr>
                <tr><th class="label-cell">Actividades:</th><td>${data.actividades || ''}</td></tr>
            </table>

            <table>
                <tr><th colspan="3" class="section-title">5. RESPONSABLES</th></tr>
                <tr style="background-color: #f2f2f2; text-align:center;">
                    <th>Elaborado por:</th>
                    <th>Revisado por:</th>
                    <th>Aprobado por:</th>
                </tr>
                <tr style="height: 60px;">
                    <td>${data.elaboradoPor || ''}</td>
                    <td>${data.revisadoPor || ''}</td>
                    <td>${data.aprobadoPor || ''}</td>
                </tr>
            </table>
            
            <p style="font-size: 7pt; color: #999; text-align: right;">Generado por AGROIDEAS GxP Antigravity System - ${new Date().toLocaleString()}</p>
        </body>
        </html>`;
    }
};

window.exporter = exportEngine;
