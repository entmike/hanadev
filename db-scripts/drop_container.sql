-- Adapted from and Credit to Thomas Jung's blog https://blogs.sap.com/2019/04/16/developing-with-hana-deployment-infrastructure-hdi-without-xsacf-or-web-ide/
CREATE LOCAL TEMPORARY COLUMN TABLE #PARAMETERS LIKE _SYS_DI.TT_PARAMETERS;
INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_WORK', true );
INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_DEPLOYED', true );
CALL _SYS_DI.DROP_CONTAINER('&2', #PARAMETERS, ?, ?, ?);
DROP TABLE #PARAMETERS;
