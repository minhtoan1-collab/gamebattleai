import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import worldsRouter from "./worlds";
import locationsRouter from "./locations";
import travelRouter from "./travel";
import npcsRouter from "./npcs";
import battlesRouter from "./battles";
import inventoryRouter from "./inventory";
import progressionRouter from "./progression";
import interactRouter from "./interact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(charactersRouter);
router.use(worldsRouter);
router.use(locationsRouter);
router.use(travelRouter);
router.use(npcsRouter);
router.use(battlesRouter);
router.use(inventoryRouter);
router.use(progressionRouter);
router.use(interactRouter);

export default router;
