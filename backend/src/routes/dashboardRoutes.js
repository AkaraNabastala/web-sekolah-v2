import { Router } from 'express';
import { requireContentAdmin } from '../middleware/auth.js';
import { getDashboardActivities, getDashboardStatistics } from '../controllers/dashboardController.js';
export const dashboardRouter = Router();
dashboardRouter.get('/statistics', requireContentAdmin, getDashboardStatistics);
dashboardRouter.get('/activities', requireContentAdmin, getDashboardActivities);
