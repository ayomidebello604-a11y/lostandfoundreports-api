import * as z from "zod";


 export const Report = z.object({
  student_id: z.string().trim().nonempty().max(20),
  item_name: z.string().trim().nonempty().max(150),
  description: z.string().trim().nonempty(),
  type: z.literal(["lost", "found"]),
  status: z.literal(["open", "closed", "returned", "claimed"]).optional(),
  category: z.string().trim().nonempty().max(50),
  location: z.string().trim().nonempty().max(150),
  contact_details: z.optional(z.string().trim().max(150).nonempty()).nullable(),
 });


export  type newReportInput = z.infer<typeof Report>
const newReport = Report.safeParse({
    description: "blue black bag",
    id: 5
})

export const PaginationQuery = z.object({
  page: z.coerce.number().int().gte(1),
  limit: z.coerce.number().int().gte(1).max(100)
});

export type queryType = z.infer<typeof PaginationQuery>

export const Ticket = z.object({
  movie: z.string().trim().nonempty().max(70),
  seat: z.string().trim().nonempty().max(70),
  price: z.number().int(),
});

 export type newMovieInput = z.infer<typeof Ticket>

export const TicketId = z.string().trim().regex(/^T\d+$/).nonempty()

export type newTicketIdInput = z.infer<typeof TicketId>
