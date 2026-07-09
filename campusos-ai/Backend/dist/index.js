import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authRouter } from './routes/auth.routes.js';
import { notesRouter } from './routes/notes.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { assistantRouter } from './routes/assistant.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { studyPlannerRouter } from './routes/studyPlanner.routes.js';
const app = express();
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/ai', aiRouter);
app.use('/api/study-planner', studyPlannerRouter);
app.get('/', (_req, res) => {
    res.json({
        message: 'CampusOS AI Backend Running 🚀',
    });
});
// Basic 404
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(config.PORT, () => {
    console.log(`CampusOS AI Backend listening on http://localhost:${config.PORT}`);
});
