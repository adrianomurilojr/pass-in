import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async  function registerForEvent(app: FastifyInstance) {
app.withTypeProvider<ZodTypeProvider>()
.post('/events/:eventId/attendees', {
  schema: {
    body: z.object({
      name: z.string().min(4),
      email: z.string().email()
    }),
    params: z.object({
      eventId: z.string().uuid()
    }),
    response: {
      201: z.object({
        attendeeId: z.number()
      })
    }
  }
}, async (request, reply) => {
  const { eventId } = request.params
  const { name, email } = request.body

  const AttendeeWhereUniqueInput = await prisma.attendee.findUnique({
    where: {
      eventId_email: {
        email,
        eventId,
      }
    }
  })

  if(AttendeeWhereUniqueInput !== null) {
    throw new Error('This e-mail is already registered for this event')
  }

  const [event, amounttofAttendeesForEvent] = await Promise.all([
    prisma.event.findUnique({
      where: {
        id: eventId,
      }
    }),

    prisma.attendee.count({
      where: {
        eventId,
      }
    })
  ])
  
  if(event?.maximumAttendees && amounttofAttendeesForEvent >= event.maximumAttendees) {
    throw new Error('The maximum number of attendees for this event has reached.')
  }

  const attendee = await prisma.attendee.create({
    data: {
      name,
      email,
      eventId
    }
  })

  return reply.status(201).send({attendeeId: attendee.id})
})

}