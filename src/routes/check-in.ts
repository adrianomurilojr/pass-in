import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client/extension";

export async function checkIn(app: FastifyInstance) {
app
.withTypeProvider<ZodTypeProvider>()
.get('/attendees/:attendeeId/check-in', {
  schema: {
    params: z.object({
      attendeeId: z.coerce.number().int()
    }),
    response: {
      201: z.null(),
    }
  }
}, async (request, reply) => {
  const { attendeeId } = request.params

  const attendeeCheckIn = await prisma.checkIn.findUnique({
    where: {
      attendeeId
    }
  })

  if (attendeeCheckIn !== null) {
    throw new Error ('Ateendee already checked in')
  }

    await prisma.checkIn.create({  //apresentando  erro aqui
    data: {
      attendeeId,
    }
  })

  return reply.status(201).send()
  })
}