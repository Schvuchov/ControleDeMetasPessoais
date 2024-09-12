import fastify from "fastify";
import { createGoal } from "../functions/create-goal";
import z from 'zod'

const app = fastify()

//criando rota para add goals
app.post('/goals', async (request) => {

    //zod para criar a validação 
    const createGoalSchema = z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
    })

    const body = createGoalSchema.parse(request.body) //parse : caso não tenha as inf ele vai dar erro

    await createGoal({
        title: body.title,
        desiredWeeklyFrequency: body.desiredWeeklyFrequency,
    })
})

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP server running!')
})