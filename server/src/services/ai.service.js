const axios = require('axios');

// Asegurar que OLLAMA_HOST tenga el protocolo correcto
let OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Normalizar la URL si no tiene protocolo
if (!OLLAMA_HOST.startsWith('http://') && !OLLAMA_HOST.startsWith('https://')) {
  OLLAMA_HOST = `http://${OLLAMA_HOST}`;
}

// Remover slash final si existe
OLLAMA_HOST = OLLAMA_HOST.replace(/\/$/, '');

const generateGoalPlan = async (mainGoal) => {
  const prompt = `You are a helpful assistant that breaks down goals into actionable steps.

Goal: "${mainGoal}"

Create a detailed plan with 2-4 subgoals. Each subgoal should have 2-5 specific actions.

Return ONLY a JSON object with this exact structure:
{
  "subgoals": [
    {
      "title": "Subgoal Title",
      "weight": 50,
      "actions": [
        { "title": "Specific action to take", "weight": 50 },
        { "title": "Another specific action", "weight": 50 }
      ]
    }
  ]
}

Rules:
- Subgoal weights must sum to 100
- Action weights within each subgoal must sum to 100
- Be specific and actionable
- Return ONLY valid JSON, no markdown or extra text`;

  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: 'llama3',
      prompt: prompt,
      stream: false,
      format: 'json'
    });

    const parsed = JSON.parse(response.data.response);

    // Ensure the response has the correct structure
    if (!parsed.subgoals || !Array.isArray(parsed.subgoals)) {
      throw new Error('Invalid response structure from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw new Error('Failed to generate plan. Make sure Ollama is running with llama3 model.');
  }
};

module.exports = { generateGoalPlan };
