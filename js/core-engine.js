/**
 * core-engine.js
 * Motor central de AGROIDEAS GxP.
 * Gestiona la jerarquía, validación y exportación de datos.
 */

class CoreEngine {
    constructor() {
        this.categories = {
            'E': 'ESTRATÉGICOS',
            'M': 'MISIONALES',
            'S': 'SOPORTE'
        };
    }

    /**
     * Construye el árbol jerárquico completo (Nivel 0 al 4)
     */
    buildTree() {
        const inventario = db.get(db.DB_KEYS.INVENTARIO) || [];
        const mapa0 = db.get(db.DB_KEYS.MAPA_NIVEL_0) || [];
        const tree = {};

        // 1. Inicializar Raíces (Categorías)
        Object.values(this.categories).forEach(cat => {
            tree[cat] = { name: cat, type: 'category', children: {} };
        });

        // 2. Inicializar Nivel 0 (Macroprocesos) desde el Mapa Oficial
        mapa0.forEach(proc => {
            const cat = this.getCategoryName(proc.id);
            if (cat && tree[cat]) {
                tree[cat].children[proc.id] = {
                    id: proc.id,
                    name: proc.denominacion,
                    level: 0,
                    type: proc.tipo,
                    children: {}
                };
            }
        });

        // 3. Poblar niveles inferiores (1 a 4)
        inventario.forEach(item => {
            const cat = this.getCategoryName(item.codigo_nivel_0);
            const l0_id = item.codigo_nivel_0;

            // Validar que exista el macroproceso raíz
            if (tree[cat] && tree[cat].children[l0_id]) {
                let currentLevel = tree[cat].children[l0_id].children;

                // Nivel 1
                if (item.codigo_nivel_1) {
                    if (!currentLevel[item.codigo_nivel_1]) {
                        currentLevel[item.codigo_nivel_1] = { 
                            id: item.codigo_nivel_1, 
                            name: item.denominacion_nivel_1 || "Sin nombre", 
                            level: 1, 
                            children: {} 
                        };
                    }
                    // Bajar un nivel en el puntero
                    let level1Children = currentLevel[item.codigo_nivel_1].children;

                    // Nivel 2
                    if (item.codigo_nivel_2) {
                        if (!level1Children[item.codigo_nivel_2]) {
                            level1Children[item.codigo_nivel_2] = { 
                                id: item.codigo_nivel_2, 
                                name: item.denominacion_nivel_2 || "Sin nombre", 
                                level: 2, 
                                children: {} 
                            };
                        }
                        let level2Children = level1Children[item.codigo_nivel_2].children;

                        // Nivel 3
                        if (item.codigo_nivel_3) {
                            if (!level2Children[item.codigo_nivel_3]) {
                                level2Children[item.codigo_nivel_3] = { 
                                    id: item.codigo_nivel_3, 
                                    name: item.denominacion_nivel_3 || "Sin nombre", 
                                    level: 3, 
                                    children: {} 
                                };
                            }
                            let level3Children = level2Children[item.codigo_nivel_3].children;

                            // Nivel 4
                            if (item.codigo_nivel_4) {
                                if (!level3Children[item.codigo_nivel_4]) {
                                    level3Children[item.codigo_nivel_4] = { 
                                        id: item.codigo_nivel_4, 
                                        name: item.denominacion_nivel_4 || "Sin nombre", 
                                        level: 4, 
                                        children: {} 
                                    };
                                }
                            }
                        }
                    }
                }
            }
        });

        return tree;
    }

    /**
     * Retorna el nombre de la categoría basado en el prefijo (E, M, S).
     */
    getCategoryName(id) {
        if (!id || typeof id !== 'string') return null;
        const char = id.charAt(0).toUpperCase();
        return this.categories[char] || null;
    }

    /**
     * Validación GeP de Integridad
     */
    validateEntry(entry) {
        if (!entry.codigo_nivel_0 || !entry.denominacion_nivel_0) return false;
        return /^[E|M|S]\.\d{2}/.test(entry.codigo_nivel_0);
    }

    /**
     * Sanitización Pro-Max
     */
    /**
     * Obtiene la ficha técnica de un proceso, aplicando herencia desde el padre si es necesario.
     */
    getFicha(code) {
        const allFichas = db.get('FICHAS_TECNICAS') || {};
        const fichaLocal = allFichas[code] || {};
        
        // Si no es Nivel 0, buscar herencia del padre
        if (code.includes('.')) {
            const parentCode = code.split('.').slice(0, -1).join('.');
            const fichaParent = this.getFicha(parentCode); // Recursivo para herencia multinivel
            
            return {
                ...fichaLocal,
                heredado: {
                    objetivo_estrategico: fichaParent.objetivo_estrategico || '',
                    requisitos_normativos: fichaParent.requisitos_normativos || []
                }
            };
        }
        
        return fichaLocal;
    }

    saveFicha(code, data) {
        const allFichas = db.get('FICHAS_TECNICAS') || {};
        allFichas[code] = data;
        db.save('FICHAS_TECNICAS', allFichas);
    }

    /**
     * Genera el script de Google para automatización de nube
     */
    generateGAS() {
        const tree = this.buildTree();
        return `function crearEstructura() {
  const root = DriveApp.getRootFolder();
  const base = root.createFolder("SISTEMA_GxP_AGROIDEAS_" + new Date().toLocaleDateString());
  const structure = ${JSON.stringify(tree, null, 2)};
  process(base, structure);
}
function process(parent, data) {
  for(let k in data) {
    let node = data[k];
    let folderName = node.id || node.name || k;
    let folder = parent.createFolder(folderName);
    if(node.children) process(folder, node.children);
  }
}`;
    }
}

window.core = new CoreEngine();
