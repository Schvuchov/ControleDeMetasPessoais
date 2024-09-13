import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals';


export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
    //criando rota para ver as pending goals
    app.get('/pending-goals', async () => {
        const { pendingGoals } = await getWeekPendingGoals()
    
        return { pendingGoals }
    })
};