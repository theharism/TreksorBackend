const express = require('express');
const router = express.Router();
const powerThoughtController = require('../controllers/powerThought.controller');
const { authorize } = require('../middlewares/authenticationMiddleware');

router.post('/', authorize, powerThoughtController.createPowerThought);
router.get('/', powerThoughtController.getAllPowerThoughts);
router.get('/:id', powerThoughtController.getPowerThoughtById);
router.patch('/:id', authorize, powerThoughtController.updatePowerThought);
router.delete('/:id', authorize, powerThoughtController.deletePowerThought);

module.exports = router;