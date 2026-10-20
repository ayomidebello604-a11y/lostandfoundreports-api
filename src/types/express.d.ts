import type { LoginInput, RegisterInput } from "../schema/auth.schema.ts";
import type { newReportInput,newMovieInput,newTicketIdInput, queryType } from "../schema/lostandfound.schema.ts";


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
declare global {
  namespace Express {
    interface Request {
        validatedLoginBody?: LoginInput
      }
    }
}
declare global {
  namespace Express {
    interface Request {
      validatedRegisterBody?: RegisterInput
    }
  }
}
declare global {
  namespace Express {
    interface Request {
    userId: string
    }
  }
}