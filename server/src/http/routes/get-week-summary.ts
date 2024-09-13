import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { getWeekSummary } from '../../functions/get-week-summary';


export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
    //criando rota para ver as pending goals
    app.get('/summary', async () => {
        const { summary } = await getWeekSummary()
    
        return { summary }
    })
};