import { Router } from "express";
import { validatePaginationQuery, validateReportInput } from "../middleware/lostfound.validation.ts";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getLostReports,
  getFoundReports,
  getReportsBySearchName,
  getPaginatedReports,
} from "../controllers/lostfound.controller.ts";
import { authorizeRoles, verifyUserToken } from "../middleware/auth.validation.ts";

const router = Router();

router.use(verifyUserToken)


router.post("/",validateReportInput, createReport);

router.get("/lost", getLostReports);
router.get("/found", getFoundReports);
router.get("/search", getReportsBySearchName);
router.get("/paginated",validatePaginationQuery, getPaginatedReports);


router.get("/", getAllReports);


router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", authorizeRoles("admin"),deleteReport);

export default router;
