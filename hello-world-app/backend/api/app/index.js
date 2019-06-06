const router = require('express').Router();

router.use('/api/getconfig', require('./getconfig'));
router.use('/api/getallconfig', require('./getallconfig'));
router.use('/api/backendenv', require('./backendenv'));

module.exports = router;