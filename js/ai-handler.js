/**
 * ai-handler.js
 * Soporte Multi-Proveedor: LM Studio y Google Gemini con Prompt Reforzado.
 */

const AI_CONFIG = {
    get provider() { return localStorage.getItem('AI_PROVIDER') || 'lm-studio'; },
    get token() { return localStorage.getItem('LM_API_TOKEN') || ''; },
    get geminiKey() { return localStorage.getItem('GEMINI_API_KEY') || ''; },
    get model() { 
        if (this.provider === 'gemini') return localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash';
        return localStorage.getItem('LM_MODEL') || 'qwen/qwen3.5-9b';
    }
};

/**
 * Verifica la disponibilidad del proveedor seleccionado.
 */
async function checkAIConnection() {
    const provider = AI_CONFIG.provider;
    if (provider === 'lm-studio') {
        try {
            const response = await fetch('http://localhost:1234/v1/models', {
                headers: { 'Authorization': `Bearer ${AI_CONFIG.token}` }
            });
            if (!response.ok) {
                showToast("❌ LM Studio: Error de respuesta (" + response.status + ")", "error");
                return false;
            }
            return true;
        } catch (e) { 
            showToast("❌ No se pudo conectar con LM Studio (Localhost:1234)", "error");
            return false; 
        }
    } else {
        try {
            if (!AI_CONFIG.geminiKey) {
                showToast("⚠️ API Key de Gemini no configurada", "warning");
                return false;
            }
            // Validar key con un pequeño request de modelos
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${AI_CONFIG.geminiKey}`);
            if (!response.ok) {
                const err = await response.json();
                showToast("❌ Gemini: " + (err.error?.message || "Key inválida"), "error");
                return false;
            }
            return true;
        } catch (e) { 
            showToast("❌ Error de red al conectar con Google Gemini", "error");
            return false; 
        }
    }
}

/**
 * Motores de completado.
 */
async function getAICompletion(prompt, isTechnical = false) {
    if (AI_CONFIG.provider === 'lm-studio') {
        return await callLMStudio(prompt, isTechnical);
    } else {
        return await callGemini(prompt, isTechnical);
    }
}

async function callLMStudio(prompt, isTechnical = false) {
    const systemMessage = isTechnical 
        ? "Eres un experto en arquitectura de procesos y normativa GxP. Responde SOLO con el contenido solicitado (JSON si se pide)."
        : "Eres un asistente experto en procesos GxP y arquitectura institucional. Ayuda al usuario con sus dudas de forma clara.";

    const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.token}`
        },
        body: JSON.stringify({
            model: AI_CONFIG.model,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            temperature: isTechnical ? 0.1 : 0.7
        })
    });
    
    if(!response.ok) {
        const errDesc = await response.text();
        throw new Error(`LM Studio Error: ${response.status} - ${errDesc}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content;
}

async function callGemini(prompt, isTechnical = false) {
    let modelName = AI_CONFIG.model.trim().replace(/\s+/g, '-');
    // Normalizar formato: debe empezar con models/
    if (!modelName.startsWith('models/')) {
        modelName = `models/${modelName}`;
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${AI_CONFIG.geminiKey.trim()}`;
    
    const systemInstruction = isTechnical 
        ? "Eres un experto en GxP. Analiza el texto y extrae la jerarquía de procesos. Responde ÚNICAMENTE con un array JSON válido, sin textos explicativos ni markdown."
        : "Eres un asistente experto en GxP y arquitectura de procesos de AGROIDEAS. Responde de forma cordial y profesional.";

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${systemInstruction} \n\n USUARIO: ${prompt}` }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || response.statusText || 'Error en Google Studio';
        console.error("Gemini API Error:", errorData);
        throw new Error(`Gemini: ${msg} (Verifique si la Key tiene cuotas o si el modelo '${modelName}' es correcto)`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback?.blockReason) {
            throw new Error(`Gemini bloqueó la respuesta por seguridad: ${data.promptFeedback.blockReason}`);
        }
        throw new Error("Gemini no devolvió ninguna respuesta válida.");
    }

    let text = data.candidates[0].content?.parts?.[0]?.text;
    if (!text) throw new Error("Estructura de respuesta de Gemini inesperada.");
    
    if(isTechnical) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    return text;
}

/**
 * Función especializada para analizar Fichas de Caracterización GxP.
 * Corrige fallas históricas de extracción de 'Producto' y duplicidad.
 */
async function extractGxPFicha(content) {
    const prompt = `
    Como experto en GxP y la Norma Técnica 002-2025-PCM/SGP:
    Analiza la siguiente FICHA DE CARACTERIZACIÓN.
    
    REGLAS CRÍTICAS:
    1. Extrae el campo "Producto" de la tabla de Cadena de Valor (normalmente la 4ta columna). No lo omitas.
    2. En los procesos nivel 2/desagregados, NO repitas la información de la primera fila si los campos son distintos.
    3. Asegura que el JSON tenga la estructura:
       {
         "INFORMACION_GENERAL": { "Codigo": "...", "Nombre": "...", "Dueno_del_proceso": "..." },
         "CADENA_VALOR": [
            { "Proveedor": "...", "Entradas": "...", "Proceso": "...", "Producto": "...", "Receptor": "..." }
         ]
       }
    
    CONTENIDO DEL DOCUMENTO:
    ${content}
    `;
    
    return await getAICompletion(prompt, true);
}

// --- Gestión de Configuración UI ---
function openConfig() {
    const modal = document.getElementById('config-modal');
    if (!modal) return;
    
    modal.classList.add('modal-overlay--active');
    
    const provider = AI_CONFIG.provider;
    document.getElementById('ai-provider-select').value = provider;
    document.getElementById('gemini-key-input').value = AI_CONFIG.geminiKey;
    document.getElementById('gemini-model-input').value = AI_CONFIG.model.replace('models/', '');
    document.getElementById('lm-token-input').value = AI_CONFIG.token;
    
    // Configurar visibilidad inicial
    toggleModalFields(provider);
}

function toggleModalFields(provider) {
    const geminiGroup = document.getElementById('gemini-config-group');
    const lmGroup = document.getElementById('lm-config-group');
    if (geminiGroup) geminiGroup.style.display = provider === 'gemini' ? 'block' : 'none';
    if (lmGroup) lmGroup.style.display = provider === 'lm-studio' ? 'block' : 'none';
}

// Escuchar cambios en el selector del modal
document.addEventListener('change', (e) => {
    if (e.target.id === 'ai-provider-select') {
        toggleModalFields(e.target.value);
    }
});

function closeConfig() {
    const modal = document.getElementById('config-modal');
    if (modal) modal.classList.remove('modal-overlay--active');
}

function saveConfig() {
    // Detectar si el guardado viene del modal o del panel lateral (ahora simplificado)
    const modalProvider = document.getElementById('ai-provider-select');
    
    if (modalProvider) {
        localStorage.setItem('AI_PROVIDER', modalProvider.value);
        localStorage.setItem('GEMINI_API_KEY', document.getElementById('gemini-key-input').value);
        localStorage.setItem('GEMINI_MODEL', document.getElementById('gemini-model-input').value);
        localStorage.setItem('LM_API_TOKEN', document.getElementById('lm-token-input').value);
    }
    
    showToast("✅ Configuración guardada correctamente");
    closeConfig();
    
    if (typeof updateUI === 'function') {
        updateUI();
    }
}
