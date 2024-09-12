import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
        //conta quantas vezes aquela meta foi concluida. Precisa de um alias, .as(um nome)
      })
      .from(goalCompletions)
      .where(
        and(
          //registros que foram criados
          gte(goalCompletions.createdAt, firstDayOfWeek), //depois do OU no primeiro dia da semana E
          lte(goalCompletions.createdAt, lastDayOfWeek), //antes do OU no ultimo dia da semana
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId) //agrupa pelo ID da meta
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
            COALESCE(${goalCompletionCounts.completionCount}, 0) 
        `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week!')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()
  const goalCompletion = insertResult[0]

  return { goalCompletion }
}
