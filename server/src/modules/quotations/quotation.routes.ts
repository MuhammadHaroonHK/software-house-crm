import {
  Router,
} from "express";

import {
  UserRole,
} from "@prisma/client";

import {
  authenticate,
} from "../../middleware/authenticate";

import {
  authorize,
} from "../../middleware/authorize";

import {
  validate,
} from "../../middleware/validate";

import {
  quotationController,
} from "./quotation.controller";

import {
  createQuotationSchema,
  updateQuotationSchema,
  getQuotationsSchema,
} from "./quotation.validation";

const router =
  Router();

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(
    createQuotationSchema
  ),
  quotationController.create.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* LIST                                                                       */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.CLIENT
  ),
  validate(
    getQuotationsSchema
  ),
  quotationController.findAll.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* SEND                                                                       */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/send",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.send.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* ACCEPT                                                                     */
/* Client only                                                                */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/accept",
  authenticate,
  authorize(
    UserRole.CLIENT
  ),
  quotationController.accept.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* REJECT                                                                     */
/* Client only                                                                */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/reject",
  authenticate,
  authorize(
    UserRole.CLIENT
  ),
  quotationController.reject.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* EXPIRE                                                                     */
/* Internal users only                                                        */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id/expire",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.expire.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* GET BY ID                                                                  */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.CLIENT
  ),
  quotationController.findById.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(
    updateQuotationSchema
  ),
  quotationController.update.bind(
    quotationController
  )
);

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.delete.bind(
    quotationController
  )
);

export default router;