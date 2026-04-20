/**
 * ai-handler.js
 * Soporte Multi-Proveedor: LM Studio y Google Gemini con Prompt Reforzado.
 */

const AI_CONFIG = {
    get provider() { return localStorage.getItem('AI_PROVIDER') || 'lm-studio'; },
    get token() { return localStorage.getItem('LM_API_TOKEN') || ''; },
    get geminiKey() { return localStorage.getItem('GEMINI_API_KEY') || ''; },
    get model() { 
        if (this.provider === 'gemini') return localStorage.getItem('GEMINI_MODEL') || 'gemini-1.5-pro';
        return localStorage.getItem('LM_MODEL') || 'qwen/qwen3.5-9b';
    }
};

/**
 * Verifica la disponibilidad del proveedor seleccionado.
 */
async function checkAIConnection() {
    if (AI_CONFIG.provider === 'lm-studio') {
        try {
            const response = await fetch('http://localhost:1234/api/v1/models', {
                headers: { 'Authorization': `Bearer ${AI_CONFIG.token}` }
            });
            return response.ok;
        } catch (e) { return false; }
    } else {
        try {
            if (!AI_CONFIG.geminiKey) return false;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${AI_CONFIG.geminiKey}`);
            return response.ok;
        } catch (e) { return false; }
    }
}

/**
 * Motor de completado universal.
 */
async function getAICompletion(prompt) {
    if (AI_CONFIG.provider === 'lm-studio') {
        return await callLMStudio(prompt);
    } else {
        return await callGemini(prompt);
    }
}

async function callLMStudio(prompt) {
    const response = await fetch('http://localhost:1234/api/v1/chat', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.token}`
        },
        body: JSON.stringify({
            model: AI_CONFIG.model,
            system_prompt: "Eres un experto en GxP. Responde SOLO en JSON.",
            input: prompt
        })
    });
    if(!response.ok) throw new Error('Error en LM Studio');
    const data = await response.json();
    return data.output || data.choices?.[0]?.message?.content;
}

async function callGemini(prompt) {
    const modelName = AI_CONFIG.model.trim();
    // Volvemos a v1beta que es más compatible con prompts de sistema
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${AI_CONFIG.geminiKey.trim()}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `INSTRUCCIÓN: Eres un experto en GxP. Analiza el siguiente texto y extrae la jerarquía de procesos. Responde ÚNICAMENTE con un array JSON válido, sin textos explicativos ni bloques de código markdown. DOCUMENTO: ${prompt}` }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en Google Studio');
    }
    
    const data = await response.json();
    // Extraemos el texto crudo de la respuesta
    let text = data.candidates[0].content.parts[0].text;
    
    // Limpieza de Markdown si Gemini lo incluye por error
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return text;
}
