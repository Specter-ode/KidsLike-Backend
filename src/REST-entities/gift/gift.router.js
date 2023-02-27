import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import tryCatchWrapper from "../../helpers/tryCatchWrapper.js";
import * as ctrl from "./gift.controller.js";
import * as giftJoiSchemas from "./gift.schemas.js";
import { upload } from "../../middlewares/multer.js";

const router = Router();

router.get("/", authenticate, tryCatchWrapper(ctrl.getGifts));
router.post(
  "/:childId",
  authenticate,
  upload.single("avatar"),
  validate(giftJoiSchemas.addOrBuyParamsSchema, "params"),
  validate(giftJoiSchemas.addGiftSchema),
  tryCatchWrapper(ctrl.addGift)
);
router
  .route("/:giftId")
  .put(
    authenticate,
    upload.single("avatar"),
    validate(giftJoiSchemas.editOrDeleteParamsSchema, "params"),
    validate(giftJoiSchemas.editGiftSchema),
    tryCatchWrapper(ctrl.editGift)
  )
  .delete(
    authenticate,
    validate(giftJoiSchemas.editOrDeleteParamsSchema, "params"),
    tryCatchWrapper(ctrl.deleteGift)
  );
router.patch(
  "/buy/:childId",
  authenticate,
  validate(giftJoiSchemas.addOrBuyParamsSchema, "params"),
  validate(giftJoiSchemas.buyGiftsSchema),
  tryCatchWrapper(ctrl.buyGifts)
);

export default router;
