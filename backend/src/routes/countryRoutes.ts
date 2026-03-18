import { Router } from 'express';
import {
  getCountries,
  getCountryByCode,
  getCountryIndicators,
  getCountryAnalytics,
  getGeoGeometry,
  getCountryNeighbours
} from '../controllers/countryController.js';
import {
  getSimulationBaseline,
  getGlobalRankings,
  getIndicatorHistory
} from '../controllers/simulationController.js';

const router = Router();

// Country data
router.get('/countries', getCountries);
router.get('/country/:code', getCountryByCode);
router.get('/country/:code/neighbours', getCountryNeighbours);
router.get('/country/:code/indicators', getCountryIndicators);
router.get('/country/:code/analytics', getCountryAnalytics);
router.get('/geo', getGeoGeometry);

// Simulation & Indicators
router.get('/simulation/baseline/:code', getSimulationBaseline);
router.get('/simulation/rankings', getGlobalRankings);
router.get('/indicators/:code/history', getIndicatorHistory);

export default router;
