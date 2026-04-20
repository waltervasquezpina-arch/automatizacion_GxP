/**
 * admin-manager.js
 * Lógica de edición visual del árbol (CRUD de niveles).
 */

class AdminManager {
    constructor() {
        this.tree = null;
        this.containerId = 'visual-editor-tree';
    }

    /**
     * Inicializa y renderiza el árbol editable.
     */
    refreshTree() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Reutilizamos el motor central
        this.tree = core.buildTree();
        
        container.innerHTML = '';
        Object.keys(this.tree).forEach(category => {
            const catNode = this.tree[category];
            if (Object.keys(catNode.children).length > 0) {
                const catDiv = document.createElement('div');
                catDiv.className = 'admin-category-header';
                catDiv.innerHTML = `<h4>${category}</h4>`;
                container.appendChild(catDiv);

                Object.keys(catNode.children).sort().forEach(code => {
                    container.appendChild(this.renderEditableNode(code, catNode.children[code]));
                });
            }
        });
    }

    renderEditableNode(code, node) {
        const div = document.createElement('div');
        div.className = `admin-node admin-node--level-${node.level}`;
        
        div.innerHTML = `
            <div class="admin-node__header">
                <div class="admin-node__info">
                    <span class="node-code">${code}</span>
                    <span class="admin-node__name">${node.name}</span>
                </div>
                <div class="admin-node__tools">
                    <button class="btn-tool" onclick="admin.openEdit('${code}', '${node.name}')" title="Editar">✏️</button>
                    <button class="btn-tool" onclick="admin.openAddChild('${code}')" title="Añadir hijo">➕</button>
                    ${node.level > 0 ? `<button class="btn-tool btn-tool--danger" onclick="admin.deleteNode('${code}')" title="Eliminar">🗑️</button>` : ''}
                </div>
            </div>
            <div class="admin-node__children"></div>
        `;

        const childrenContainer = div.querySelector('.admin-node__children');
        if (node.children) {
            Object.keys(node.children).sort().forEach(childCode => {
                childrenContainer.appendChild(this.renderEditableNode(childCode, node.children[childCode]));
            });
        }

        return div;
    }

    openEdit(code, name) {
        document.getElementById('edit-code').value = code;
        document.getElementById('edit-name').value = name;
        document.getElementById('modal-title').textContent = 'Editar Denominación';
        document.getElementById('add-sub-fields').style.display = 'none';
        
        document.getElementById('btn-save-edit').onclick = () => this.saveEdit();
        document.getElementById('edit-modal').classList.add('detail-panel--active');
    }

    openAddChild(parentCode) {
        document.getElementById('edit-code').value = parentCode;
        document.getElementById('modal-title').textContent = 'Añadir Nuevo Subproceso';
        document.getElementById('add-sub-fields').style.display = 'block';
        document.getElementById('new-sub-code').value = parentCode + '.01'; // Sugerencia
        
        document.getElementById('btn-save-edit').onclick = () => this.saveAdd();
        document.getElementById('edit-modal').classList.add('detail-panel--active');
    }

    closeModal() {
        document.getElementById('edit-modal').classList.remove('detail-panel--active');
    }

    saveEdit() {
        const code = document.getElementById('edit-code').value;
        const newName = document.getElementById('edit-name').value;
        
        let inv = db.get(db.DB_KEYS.INVENTARIO) || [];
        let mapa0 = db.get(db.DB_KEYS.MAPA_NIVEL_0) || [];

        // Si es Nivel 0 (E.01, etc)
        if (!code.includes('.')) {
            mapa0 = mapa0.map(p => p.metadatos.codigo === code ? { ...p, datos_generales: { ...p.datos_generales, denominacion: newName } } : p);
            db.save(db.DB_KEYS.MAPA_NIVEL_0, mapa0);
        } else {
            // Es Nivel 1-4
            inv = inv.map(p => {
                if (p.codigo_nivel_1 === code) p.denominacion_nivel_1 = newName;
                if (p.codigo_nivel_2 === code) p.denominacion_nivel_2 = newName;
                if (p.codigo_nivel_3 === code) p.denominacion_nivel_3 = newName;
                if (p.codigo_nivel_4 === code) p.denominacion_nivel_4 = newName;
                return p;
            });
            db.save(db.DB_KEYS.INVENTARIO, inv);
        }
        
        this.closeModal();
        this.refreshTree();
    }

    saveAdd() {
        const parentCode = document.getElementById('edit-code').value;
        const newCode = document.getElementById('new-sub-code').value;
        const newName = document.getElementById('edit-name').value;
        
        let inv = db.get(db.DB_KEYS.INVENTARIO) || [];
        
        const parentParts = parentCode.split('.');
        const l0_code = parentParts[0] + (parentParts[1] ? '.'+parentParts[1] : '');
        
        const newEntry = {
            codigo_nivel_0: parentParts[0] + '.' + (parentParts[1] || '01'), 
            denominacion_nivel_0: 'Heredado',
            // Dinámicamente determinamos campos según profundidad
            productos_asociados: "Nuevo Proceso"
        };

        const depth = newCode.split('.').length - 1; // E.01.01 -> 2
        if (depth === 2) { newEntry.codigo_nivel_1 = newCode; newEntry.denominacion_nivel_1 = newName; }
        if (depth === 3) { newEntry.codigo_nivel_2 = newCode; newEntry.denominacion_nivel_2 = newName; }
        if (depth === 4) { newEntry.codigo_nivel_3 = newCode; newEntry.denominacion_nivel_3 = newName; }
        if (depth === 5) { newEntry.codigo_nivel_4 = newCode; newEntry.denominacion_nivel_4 = newName; }

        inv.push(newEntry);
        db.save(db.DB_KEYS.INVENTARIO, inv);
        
        this.closeModal();
        this.refreshTree();
    }

    deleteNode(code) {
        if (!confirm(`¿Está seguro de eliminar el proceso ${code} y todas sus subramas?`)) return;

        let inv = db.get(db.DB_KEYS.INVENTARIO) || [];
        inv = inv.filter(p => !p.codigo_nivel_1?.startsWith(code) && 
                              !p.codigo_nivel_2?.startsWith(code) && 
                              !p.codigo_nivel_3?.startsWith(code) &&
                              !p.codigo_nivel_4?.startsWith(code));
        
        db.save(db.DB_KEYS.INVENTARIO, inv);
        this.refreshTree();
    }

    /**
     * Inyecta un bloque masivo de datos JSON con normalización inteligente.
     */
    injectBatch(data, append = true, autoNormalize = true) {
        if (!Array.isArray(data)) data = [data];

        let currentInv = append ? (db.get(db.DB_KEYS.INVENTARIO) || []) : [];
        let currentMapa = db.get(db.DB_KEYS.MAPA_NIVEL_0) || [];

        const normalizedData = data.map(entry => {
            if (!autoNormalize) return entry;
            
            // 1. Capa de Seguridad: Sanitización (Evitar XSS)
            const sanitize = (val) => {
                if (typeof val !== 'string') return val;
                return val.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "[BLOQUEADO]")
                          .replace(/on\w+=/gi, "blocked=")
                          .replace(/[<>]/g, ""); // Escapar tags básicos
            };

            // 2. Mapeo inteligente
            const map = {
                "Código Nivel 0": "codigo_nivel_0",
                "Denominación Nivel 0 (Ficha Oficial)": "denominacion_nivel_0",
                "Nombre_Nivel_0": "denominacion_nivel_0",
                "Nombre Nivel 0": "denominacion_nivel_0",
                
                "Código Nivel 1": "codigo_nivel_1",
                "Denominación Nivel 1 (Ficha Oficial)": "denominacion_nivel_1",
                "Nombre_Nivel_1": "denominacion_nivel_1",
                "Nombre Nivel 1": "denominacion_nivel_1",
                "Denominación Nivel 1": "denominacion_nivel_1",

                "Código Nivel 2": "codigo_nivel_2",
                "Denominación Nivel 2 (propuesto)": "denominacion_nivel_2",
                "Denominación Nivel 2 (Último Nivel propuesto)": "denominacion_nivel_2",
                "Nombre_Nivel_2": "denominacion_nivel_2",
                "Denominación Nivel 2": "denominacion_nivel_2",

                "Código Nivel 3": "codigo_nivel_3",
                "Denominación Nivel 3 (propuesto)": "denominacion_nivel_3",
                "Nombre_Nivel_3": "denominacion_nivel_3",
                "Denominación Nivel 3": "denominacion_nivel_3",

                "Código Nivel 4": "codigo_nivel_4",
                "Denominación Nivel 4 (propuesto)": "denominacion_nivel_4"
            };

            const newEntry = {};
            Object.keys(entry).forEach(key => {
                const normKey = map[key] || key.toLowerCase().replace(/ /g, '_');
                if (entry[key] !== null && entry[key] !== undefined) {
                    newEntry[normKey] = sanitize(entry[key]);
                }
            });

            // 3. Validación de Calidad Institucional
            if (!newEntry.codigo_nivel_0 || !newEntry.denominacion_nivel_0) {
                console.warn("Registro rechazado: Falta Nivel 0 fundamental.");
                return null;
            }

            // Validar formato de código básico (Letra.Numero)
            const codeRegex = /^[E|M|S]\.\d{2}/;
            if (!codeRegex.test(newEntry.codigo_nivel_0)) {
                console.warn(`Registro rechazado: Formato de código ${newEntry.codigo_nivel_0} inválido.`);
                return null;
            }

            // Actualizar Mapa Nivel 0 automáticamente
            if (newEntry.codigo_nivel_0 && newEntry.denominacion_nivel_0) {
                const exists = currentMapa.some(m => m.id === newEntry.codigo_nivel_0);
                if (!exists) {
                    currentMapa.push({
                        id: newEntry.codigo_nivel_0,
                        denominacion: newEntry.denominacion_nivel_0,
                        tipo: newEntry.codigo_nivel_0.startsWith('E') ? 'Estratégico' : 
                              (newEntry.codigo_nivel_0.startsWith('M') ? 'Misional' : 'Soporte')
                    });
                }
            }

            return newEntry;
        }).filter(e => e !== null); // Eliminar registros inválidos

        // Guardar cambios si hay datos válidos
        if (normalizedData.length === 0) {
            throw new Error("No se encontraron registros válidos que cumplan con la estructura institucional.");
        }

        db.save(db.DB_KEYS.INVENTARIO, [...currentInv, ...normalizedData]);
        db.save(db.DB_KEYS.MAPA_NIVEL_0, currentMapa);
        
        this.refreshTree();
    }

    /**
     * Inyecta Fichas Técnicas masivamente desde archivos JSON alineados al estándar inmutable de MIDAGRI.
     */
    injectFichas(data) {
        if (!Array.isArray(data)) data = [data];

        const allFichas = db.get('FICHAS_TECNICAS') || {};

        data.forEach(item => {
            // Soporte para ambos estilos de raíz (camel y snake) del estándar inmutable
            const ficha = item.fichaDeProductoYProceso || item.ficha_de_producto_y_proceso || item;
            const code = ficha.codigo;

            if (code) {
                allFichas[code] = ficha;
                console.log(`✅ Ficha ${code} cargada exitosamente.`);
            }
        });

        db.save('FICHAS_TECNICAS', allFichas);
    }
}

window.admin = new AdminManager();
