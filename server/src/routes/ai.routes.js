const express = require('express');
const { generateGoalPlan } = require('../services/ai.service');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/generate', authenticateToken, async (req, res) => {
    const { mainGoal } = req.body;
    if (!mainGoal) return res.status(400).json({ error: 'Main goal is required' });

    try {
        const plan = await generateGoalPlan(mainGoal);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate plan' });
    }
});

module.exports = router;
