const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all goals for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const goals = await prisma.goal.findMany({
            where: { userId: req.user.id },
            include: {
                subGoals: {
                    include: { actions: true }
                }
            }
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching goals' });
    }
});

// Create a new goal (with nested subgoals/actions)
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, startDate, endDate, subGoals } = req.body;
    try {
        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId: req.user.id,
                subGoals: {
                    create: subGoals.map(sg => ({
                        title: sg.title,
                        weight: sg.weight,
                        actions: {
                            create: sg.actions.map(a => ({
                                title: a.title,
                                weight: a.weight
                            }))
                        }
                    }))
                }
            },
            include: {
                subGoals: {
                    include: { actions: true }
                }
            }
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating goal' });
    }
});

// Toggle Action Completion
router.patch('/actions/:id/toggle', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const action = await prisma.action.findUnique({
            where: { id: parseInt(id) },
            include: {
                subGoal: {
                    include: {
                        goal: {
                            include: {
                                subGoals: {
                                    include: {
                                        actions: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!action) return res.status(404).json({ error: 'Action not found' });

        // Toggle action completion
        const updatedAction = await prisma.action.update({
            where: { id: parseInt(id) },
            data: { isCompleted: !action.isCompleted }
        });

        // Check if all actions in the goal are completed
        const goal = action.subGoal.goal;
        const allActions = goal.subGoals.flatMap(sg => sg.actions);
        const allCompleted = allActions.every(a =>
            a.id === parseInt(id) ? !action.isCompleted : a.isCompleted
        );

        // Update goal completion status
        if (allCompleted !== goal.isCompleted) {
            await prisma.goal.update({
                where: { id: goal.id },
                data: { isCompleted: allCompleted }
            });
        }

        res.json(updatedAction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating action' });
    }
});

// Update Goal
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    try {
        const goal = await prisma.goal.findFirst({
            where: { id: parseInt(id), userId: req.user.id }
        });
        if (!goal) return res.status(404).json({ error: 'Goal not found' });

        const updatedGoal = await prisma.goal.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            },
            include: {
                subGoals: {
                    include: { actions: true }
                }
            }
        });
        res.json(updatedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating goal' });
    }
});

// Delete Goal
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const goal = await prisma.goal.findFirst({
            where: { id: parseInt(id), userId: req.user.id }
        });
        if (!goal) return res.status(404).json({ error: 'Goal not found' });

        await prisma.goal.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting goal' });
    }
});

// Update SubGoal
router.put('/subgoals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, weight } = req.body;
    try {
        const updatedSubGoal = await prisma.subGoal.update({
            where: { id: parseInt(id) },
            data: { title, weight }
        });
        res.json(updatedSubGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating subgoal' });
    }
});

// Delete SubGoal
router.delete('/subgoals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.subGoal.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'SubGoal deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting subgoal' });
    }
});

// Update Action
router.put('/actions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, weight } = req.body;
    try {
        const updatedAction = await prisma.action.update({
            where: { id: parseInt(id) },
            data: { title, weight }
        });
        res.json(updatedAction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating action' });
    }
});

// Delete Action
router.delete('/actions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.action.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Action deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting action' });
    }
});

module.exports = router;
