import dayjs from 'dayjs'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { sql, and, lte, gte, count, eq } from 'drizzle-orm'


export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  
  //querie pegando todas as metas onde a data de criação é menor ou igual ao ultimo dia da semana
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

  //querie para contagem de metas concluidas dentro dessa semana
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

  //queria que vai usar as outras queries
  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        completionCount: sql`
            COALESCE(${goalCompletionCounts.completionCount}, 0) 
        `.mapWith(Number),

        //COALESCE  permite fazer um IF caso aquela variavel seja null vai retornar um valor default, no caso 0
        //mapWith(number) pq o colaesce retorna string
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id))

    //join onde o goalCompletionCounts.goalId =  goalsCreatedUpToWeek.id
    //leftJoin pq quero mostrar mesmo que não se tenha completado a meta nenhuma vez 

  return {
    pendingGoals,
  }
}
