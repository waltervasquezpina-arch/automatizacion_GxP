/**
 * storage.js
 * Controlador de persistencia en localStorage.
 */

class StorageController {
    constructor() {
        this.DB_KEYS = {
            INVENTARIO: 'PROCESOS_INVENTARIO',
            MAPA_NIVEL_0: 'PROCESOS_NIVEL_0',
            CONFIG: 'APP_CONFIG'
        };
    }

    /**
     * Inicializa el sistema desde el archivo JSON maestro si el almacenamiento está vacío.
     */
    async bootstrap() {
        if (this.get(this.DB_KEYS.INVENTARIO)) return true;

        try {
            const response = await fetch('datos/inventario_maestro.json');
            if (!response.ok) throw new Error('Archivo maestro inaccesible.');
            const data = await response.json();
            
            if (data.mapa_nivel_0) this.save(this.DB_KEYS.MAPA_NIVEL_0, data.mapa_nivel_0);
            if (data.inventario_maestro) this.save(this.DB_KEYS.INVENTARIO, data.inventario_maestro);
            if (data.fichas_tecnicas) this.save('FICHAS_TECNICAS', data.fichas_tecnicas);
            
            console.log("🚀 Sistema inicializado exitosamente (Inventario + Fichas).");
            return true;
        } catch (e) {
            console.error("❌ Fallo de Bootstrap:", e.message);
            return false;
        }
    }

    /**
     * Guarda un objeto/array en localStorage serializado.
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('❌ Error al guardar en localStorage:', e);
            return false;
        }
    }

    /**
     * Obtiene y parsea un objeto de localStorage.
     */
    get(key) {
        const data = localStorage.getItem(key);
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('❌ Error al parsear datos de localStorage:', e);
            return null;
        }
    }

    /**
     * Fuerza la recarga del sistema desde el archivo JSON maestro, sobrescribiendo lo existente.
     */
    async forceLoadMaster() {
        try {
            const response = await fetch('datos/inventario_maestro.json');
            if (!response.ok) throw new Error('Archivo maestro inaccesible.');
            const data = await response.json();
            
            if (data.mapa_nivel_0) this.save(this.DB_KEYS.MAPA_NIVEL_0, data.mapa_nivel_0);
            if (data.inventario_maestro) this.save(this.DB_KEYS.INVENTARIO, data.inventario_maestro);
            if (data.fichas_tecnicas) this.save('FICHAS_TECNICAS', data.fichas_tecnicas);
            
            console.log("♻️ Inventario Maestro recargado forzosamente.");
            return true;
        } catch (e) {
            console.error("❌ Fallo en recarga forzada:", e.message);
            return false;
        }
    }

    /**
     * Limpia la base de datos (para pruebas).
     */
    clearAll() {
        localStorage.removeItem(this.DB_KEYS.INVENTARIO);
        localStorage.removeItem(this.DB_KEYS.MAPA_NIVEL_0);
        localStorage.removeItem(this.DB_KEYS.CONFIG);
        location.reload();
    }
}

// Instancia global del controlador
window.db = new StorageController();
