import { and, count, gte, lte } from "drizzle-orm"
import { db } from "../db"
import { goalCompletions, goals } from "../db/schema"
import dayjs from "dayjs"

export async function getWeekSummary() {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db
          .select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createdAt: goals.createdAt,
          })
          .from(goals)
          .where(lte(goals.createdAt, lastDayOfWeek)) //lte lower than equal
      )

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
              lte(goalCompletions.createdAt, lastDayOfWeek) //antes do OU no ultimo dia da semana
            )
          )
          .groupBy(goalCompletions.goalId) //agrupa pelo ID da meta
      )

    return {
        summary: 'teste',
    }
}