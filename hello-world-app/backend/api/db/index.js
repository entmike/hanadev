const router = require('express').Router();

router.use('/api/overview', require('./overview')); 
router.use('/api/diagnose', require('./diagnose'));
router.use('/api/setupUser', require('./setupUser'));
router.use('/api/setupprivileges', require('./setupPrivileges'));

module.exports = router;