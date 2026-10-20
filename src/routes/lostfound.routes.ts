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
import { verifyUserToken } from "../middleware/auth.validation.ts";

const router = Router();

router.use(verifyUserToken)

// Create a report
router.post("/",validateReportInput, createReport);

// Specific routes — keep these before "/:id"
router.get("/lost", getLostReports);
router.get("/found", getFoundReports);
router.get("/search", getReportsBySearchName);
router.get("/paginated",validatePaginationQuery, getPaginatedReports);

// Get all reports
router.get("/", getAllReports);

// Routes containing an ID
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;
