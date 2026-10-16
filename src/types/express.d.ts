import type { newReportInput,newMovieInput,newTicketIdInput, queryType } from "../zodtest.ts";


declare global {
  namespace Express {
    interface Request {
      validatedBody?: newReportInput;
    }
  }
}

export { };
    
declare global {
    namespace Express {
        interface Request {
                ValidatedTicketBody?:newMovieInput
            }
        }
}
    
export { };
  
declare global {
  namespace Express {
    interface Request {
        ValidatedTicketId?:newTicketIdInput
      }
    }
}
declare global {
  namespace Express {
    interface Request {
        validatedQuery?: queryType
      }
    }
  }
