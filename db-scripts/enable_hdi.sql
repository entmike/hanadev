-- From https://help.sap.com/viewer/6b94445c94ae495c83a19646e7c3fd56/2.0.02/en-US/6df24edbef3a4e039a7b0a7bf4acd6c8.html
DO
BEGIN
  DECLARE dbName NVARCHAR(25) = 'HXE';
  DECLARE scriptserverCount INT = 0;
  DECLARE dpserverCount INT = 0;
  DECLARE docstoreCount INT = 0;
  
  -- Start diserver
  DECLARE diserverCount INT = 0;
  SELECT COUNT(*) INTO diserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'diserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
  IF diserverCount = 0 THEN
    EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''diserver''';
  END IF;
  
  -- [OPTIONAL] For AFLLang Procedure artifacts
  SELECT COUNT(*) INTO scriptserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'scriptserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
  IF scriptserverCount = 0 THEN
    EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''scriptserver''';
  END IF;
 
  -- [OPTIONAL] For Flow Graphs or Replication Task artifacts
  SELECT COUNT(*) INTO dpserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'dpserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
  IF dpserverCount = 0 THEN
    EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''dpserver''';
  END IF;
   
  -- [OPTIONAL] For JSON DocStore and hdbcollection artifacts
  SELECT COUNT(*) INTO docstoreCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'docstore' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
  IF docstoreCount = 0 THEN
    EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''docstore''';
  END IF;
  
END;

-- From https://blogs.sap.com/2019/04/16/developing-with-hana-deployment-infrastructure-hdi-without-xsacf-or-web-ide/comment-page-1/#comment-461218
--One Time Setup - Create HDI_ADMIN User and make SYSTEM and HDI_ADMIN HDI Admins
CREATE USER HDI_ADMIN PASSWORD "&1" NO FORCE_FIRST_PASSWORD_CHANGE;
GRANT USER ADMIN to HDI_ADMIN;
CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;
INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT 'SYSTEM', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;
INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT 'HDI_ADMIN', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;
  
CALL _SYS_DI.GRANT_CONTAINER_GROUP_API_PRIVILEGES('_SYS_DI', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);
DROP TABLE #PRIVILEGES;