/**
 * export-engine.js
 * Generador de archivos Word (.docx) y Google Docs compatible para Fichas GxP.
 */

const exportEngine = {
    /**
     * Genera un archivo .docx básico (WML) que Word y Google Docs pueden abrir.
     */
    toWord(fichaData) {
        const title = fichaData.Informacion_General?.Nombre || "Ficha_GxP";
        const content = this.generateGxPHtml(fichaData);
        
        const blob = new Blob(['\ufeff', content], {
            type: 'application/msword'
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/ /g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Genera el HTML estructurado según la Norma Técnica GxP.
     */
    generateGxPHtml(data) {
        const info = data.INFORMACION_GENERAL || data.Informacion_General || {};
        const cadena = data.CADENA_VALOR || data.Cadena_de_Valor || [];
        
        return `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Ficha GxP</title>
        <style>
            body { font-family: 'Arial', sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 10pt; }
            th { background-color: #f2f2f2; text-align: left; }
            .header-sgp { background-color: #004d3d; color: white; text-align: center; font-weight: bold; padding: 10px; }
            .section-title { background-color: #c29d0b; color: white; font-weight: bold; padding: 5px; }
        </style>
        </head>
        <body>
            <div class='header-sgp'>FICHA DE CARACTERIZACIÓN DE PRODUCTO Y PROCESO</div>
            
            <table>
                <tr><th colspan="4" class="section-title">1. INFORMACIÓN GENERAL</th></tr>
                <tr><th>Código:</th><td>${info.Codigo || ''}</td><th>Versión:</th><td>${info.Version || '1.0'}</td></tr>
                <tr><th>Nombre:</th><td colspan="3">${info.Nombre || ''}</td></tr>
                <tr><th>Dueño:</th><td colspan="3">${info.Dueno_del_proceso || ''}</td></tr>
                <tr><th>Objetivo:</th><td colspan="3">${info.Objetivo_del_proceso || ''}</td></tr>
            </table>

            <table>
                <tr><th colspan="5" class="section-title">2. DESCRIPCIÓN DEL PROCESO (CADENA DE VALOR)</th></tr>
                <tr>
                    <th>Proveedor</th>
                    <th>Entradas</th>
                    <th>Proceso</th>
                    <th>Producto</th>
                    <th>Receptor</th>
                </tr>
                ${cadena.map(row => `
                    <tr>
                        <td>${row.Proveedor || ''}</td>
                        <td>${row.Entradas || ''}</td>
                        <td>${row.Proceso || ''}</td>
                        <td>${row.Producto || ''}</td>
                        <td>${row.Receptor || ''}</td>
                    </tr>
                `).join('')}
            </table>
            
            <p style="font-size: 8pt; color: #666;">Generado por AGROIDEAS GxP Antigravity System - ${new Date().toLocaleDateString()}</p>
        </body>
        </html>`;
    }
};

window.exporter = exportEngine;
