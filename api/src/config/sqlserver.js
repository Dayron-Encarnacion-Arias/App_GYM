const sql = require('mssql/msnodesqlv8');
const config = require('./env');

const pool = new sql.ConnectionPool({
  server: config.sql.server,
  database: config.sql.database,
  driver: 'msnodesqlv8',
  // En Windows, mssql/msnodesqlv8 asume SQL Server Native Client 11.
  // Usa el driver ODBC 18 que se instala actualmente con SQL Server tools.
  connectionString: [
    `Driver={${config.sql.odbcDriver}}`,
    `Server=${config.sql.server}`,
    `Database=${config.sql.database}`,
    `Trusted_Connection=${config.sql.trustedConnection ? 'yes' : 'no'}`,
    `Encrypt=${config.sql.encrypt ? 'yes' : 'no'}`,
    `TrustServerCertificate=${config.sql.trustServerCertificate ? 'yes' : 'no'}`,
  ].join(';') + ';',
  options: {
    trustedConnection: config.sql.trustedConnection,
    encrypt: config.sql.encrypt,
    trustServerCertificate: config.sql.trustServerCertificate,
  },
});

async function connectSqlServer() {
  await pool.connect();
  await pool.request().query(`
    IF OBJECT_ID(N'dbo.Workouts', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Workouts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        FocusMuscle NVARCHAR(60) NOT NULL,
        Description NVARCHAR(500) NULL,
        DurationMinutes INT NOT NULL CONSTRAINT DF_Workouts_Duration DEFAULT 60,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Workouts_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Workouts_Duration CHECK (DurationMinutes BETWEEN 1 AND 600)
      );
    END;
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes
      WHERE name = N'UX_Workouts_Name' AND object_id = OBJECT_ID(N'dbo.Workouts')
    )
      CREATE UNIQUE INDEX UX_Workouts_Name ON dbo.Workouts(Name);
  `);
  console.log(`SQL Server conectado (${config.sql.database})`);
}

module.exports = { sql, pool, connectSqlServer };
