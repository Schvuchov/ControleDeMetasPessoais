import { db, client } from '.'
import { goalCompletions, goals } from './schema'
import dayjs from 'dayjs'

async function seed() {
  //excluindo primeiro as que tem dep de chave estrangeira pra não dar conflito
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'Me exercitar', desiredWeeklyFrequency: 3 },
      { title: 'Meditar', desiredWeeklyFrequency: 1 },
    ])
    .returning() //returning vai retornar os dados inserido, como o goalId que vai precisar na debaixo

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() }, //meta concluida domingo
    { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() }, //meta concluida segunda
  ])
}

seed().finally(() => {
  client.end() //vai fechar a fn depois de executar
})
