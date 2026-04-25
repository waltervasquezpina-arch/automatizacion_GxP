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
        
        // Determinar si tiene hijos para el estilo del acordeón
        const hasChildren = node.children && Object.keys(node.children).length > 0;
        
        div.innerHTML = `
            <div class="admin-node__header ${hasChildren ? 'admin-node__header--has-children' : ''}" 
                 onclick="${hasChildren ? `admin.toggleNode(this, event)` : ''}">
                <div class="admin-node__info">
                    <span class="node-code">${code}</span>
                    <span class="admin-node__name">${node.name}</span>
                    <span class="admin-node__level-tag">Nivel ${node.level}</span>
                    ${hasChildren ? '<span class="admin-node__toggle-icon">▼</span>' : ''}
                </div>
                <div class="admin-node__tools" onclick="event.stopPropagation()">
                    <button class="btn-tool" onclick="admin.openEdit('${code}', '${node.name}')" title="Editar">✏️</button>
                    <button class="btn-tool" onclick="admin.openAddChild('${code}')" title="Añadir hijo">➕</button>
                    ${node.level > 0 ? `<button class="btn-tool btn-tool--danger" onclick="admin.deleteNode('${code}')" title="Eliminar">🗑️</button>` : ''}
                </div>
            </div>
            <div class="admin-node__children ${node.level >= 1 && hasChildren ? 'admin-node__children--collapsed' : ''}"></div>
        `;

        const childrenContainer = div.querySelector('.admin-node__children');
        if (node.children) {
            Object.keys(node.children).sort().forEach(childCode => {
                childrenContainer.appendChild(this.renderEditableNode(childCode, node.children[childCode]));
            });
        }

        return div;
    }

    toggleNode(header, event) {
        // Evitar que el clic en herramientas active el acordeón
        if (event.target.closest('.admin-node__tools')) return;

        const node = header.closest('.admin-node');
        const children = node.querySelector('.admin-node__children');
        const icon = header.querySelector('.admin-node__toggle-icon');

        if (children) {
            const isCollapsed = children.classList.toggle('admin-node__children--collapsed');
            if (icon) {
                icon.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        }
    }

    openEdit(code, name) {
        document.getElementById('edit-code').value = code;
        document.getElementById('edit-name').value = name;
        document.getElementById('modal-title').textContent = 'Editar Denominación';
        document.getElementById('add-sub-fields').style.display = 'none';
        
        document.getElementById('btn-save-edit').onclick = () => this.saveEdit();
        document.getElementById('edit-modal-overlay').classList.add('modal-overlay--active');
    }

    openAddChild(parentCode) {
        document.getElementById('edit-code').value = parentCode;
        document.getElementById('modal-title').textContent = 'Añadir Nuevo Subproceso';
        document.getElementById('add-sub-fields').style.display = 'block';
        document.getElementById('new-sub-code').value = parentCode + '.01'; // Sugerencia
        
        document.getElementById('btn-save-edit').onclick = () => this.saveAdd();
        document.getElementById('edit-modal-overlay').classList.add('modal-overlay--active');
    }

    closeModal() {
        document.getElementById('edit-modal-overlay').classList.remove('modal-overlay--active');
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

        // Capa de Seguridad: Sanitización (Evitar XSS)
        const sanitize = (val) => {
            if (val === null || val === undefined) return "";
            if (typeof val !== 'string') return String(val);
            return val.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "[BLOQUEADO]")
                      .replace(/on\w+=/gi, "blocked=")
                      .replace(/[<>]/g, ""); // Escapar tags básicos
        };

        let lastN0 = null, lastN0Name = null;
        let lastN1 = null, lastN1Name = null;
        let lastN2 = null, lastN2Name = null;
        let lastN3 = null, lastN3Name = null;

        const normalizedData = data.map(entry => {
            if (!autoNormalize) return entry;
            // Mapeo inteligente con soporte para herencia
            const getVal = (keys) => {
                for (let k of keys) if (entry[k]) return entry[k];
                return null;
            };

            const c0 = getVal(["Código Nivel 0", "codigo_nivel_0"]);
            const n0 = getVal(["Denominación Nivel 0 (Ficha Oficial)", "Nombre Nivel 0", "denominacion_nivel_0"]);
            if (c0) { lastN0 = c0; lastN0Name = n0; }

            const c1 = getVal(["Código Nivel 1", "codigo_nivel_1"]);
            const n1 = getVal(["Denominación Nivel 1 (Ficha Oficial)", "Nombre Nivel 1", "denominacion_nivel_1"]);
            if (c1) { lastN1 = c1; lastN1Name = n1; }

            const c2 = getVal(["Código Nivel 2", "codigo_nivel_2", "Denominación Nivel 2 (Ficha Oficial)"]);
            const n2 = getVal(["Denominación Nivel 2 (Ficha Oficial)", "Nombre Nivel 2", "denominacion_nivel_2", "Denominación Nivel 2 (Último Nivel propuesto)"]);
            if (c2) { lastN2 = c2; lastN2Name = n2; }

            const c3 = getVal(["Código Nivel 3", "codigo_nivel_3"]);
            const n3 = getVal(["Denominación Nivel 3 (Propuesto)", "Nombre Nivel 3", "denominacion_nivel_3"]);
            if (c3) { lastN3 = c3; lastN3Name = n3; }

            // Solo procedemos si al menos hay un código de nivel identificable por herencia o directo
            if (!lastN0) return null;

            const newEntry = {
                codigo_nivel_0: sanitize(lastN0),
                denominacion_nivel_0: sanitize(lastN0Name),
                codigo_nivel_1: sanitize(lastN1),
                denominacion_nivel_1: sanitize(lastN1Name),
                codigo_nivel_2: sanitize(lastN2),
                denominacion_nivel_2: sanitize(lastN2Name),
                codigo_nivel_3: sanitize(lastN3),
                denominacion_nivel_3: sanitize(lastN3Name),
                producto: sanitize(getVal(["Producto", "Productos Oficiales Asociados (RDE-000050)", "Productos_Asociados"])),
                receptor: sanitize(getVal(["Receptor", "receptor"]))
            };

            return newEntry;
        }).filter(e => e !== null && e.codigo_nivel_1); // Filtrar filas vacías o sin nivel 1

        // 3. Validación de Calidad Institucional
        const validData = normalizedData.map(newEntry => {
            if (!newEntry || !newEntry.codigo_nivel_0 || !newEntry.denominacion_nivel_0) {
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

        // Guardar cambios si hay datos válidos (incluyendo deduplicación por código)
        const uniqueData = [];
        const seenCodes = new Set();
        
        [...currentInv, ...validData].forEach(entry => {
            // Fingerprint: Usamos el nivel más profundo definido para diferenciar registros
            const fingerprint = entry.codigo_nivel_4 || entry.codigo_nivel_3 || entry.codigo_nivel_2 || entry.codigo_nivel_1;
            
            if (fingerprint && !seenCodes.has(fingerprint)) {
                seenCodes.add(fingerprint);
                uniqueData.push(entry);
            } else if (!fingerprint) {
                // Si por alguna razón no hay códigos de niveles 1-4, lo mantenemos
                uniqueData.push(entry);
            }
        });

        db.save(db.DB_KEYS.INVENTARIO, uniqueData);
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
