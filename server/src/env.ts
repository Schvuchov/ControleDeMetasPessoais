import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)

//parse esta verificando se oq tem em process.env esta seguindo o formato do objeto sendo uma string e uma url