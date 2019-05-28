--(Taken from Thomas Jung from https://github.com/jungsap/hdiWithoutXSA/blob/master/scripts/bootstrap.sql)
--First/One Time Setup to activate diserver on HANA 
DO
BEGIN
  DECLARE dbName NVARCHAR(25) = 'HXE'; --<-- substitute XY1 by the name of your tenant DB
  -- Start diserver
  DECLARE diserverCount INT = 0;
  SELECT COUNT(*) INTO diserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'diserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
  IF diserverCount = 0 THEN
    EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''diserver''';
  END IF;   
  
END;

--One Time Setup - Create HDI_ADMIN User and make SYSTEM and HDI_ADMIN HDI Admins
CREATE USER HDI_ADMIN PASSWORD "&1" NO FORCE_FIRST_PASSWORD_CHANGE;
GRANT USER ADMIN to HDI_ADMIN;
CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;
INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT 'SYSTEM', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;
INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT 'HDI_ADMIN', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;

CALL _SYS_DI.GRANT_CONTAINER_GROUP_API_PRIVILEGES('_SYS_DI', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);
DROP TABLE #PRIVILEGES;
