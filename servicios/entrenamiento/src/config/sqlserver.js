const sql = require('mssql');
const config = require('./env');

function createPool() {
  if (config.sql.auth === 'windows') {
    // Autenticación integrada de Windows: requiere el paquete opcional msnodesqlv8
    // y el ODBC Driver, por eso solo funciona ejecutando el servicio con Node en Windows.
    const sqlv8 = require('mssql/msnodesqlv8');
    return new sqlv8.ConnectionPool({
      server: config.sql.server,
      database: config.sql.database,
      driver: 'msnodesqlv8',
      connectionString: [
        `Driver={${config.sql.odbcDriver}}`,
        `Server=${config.sql.server}`,
        `Database=${config.sql.database}`,
        'Trusted_Connection=yes',
        `Encrypt=${config.sql.encrypt ? 'yes' : 'no'}`,
        `TrustServerCertificate=${config.sql.trustServerCertificate ? 'yes' : 'no'}`,
      ].join(';') + ';',
    });
  }

  // Autenticación SQL (usuario/contraseña) con el driver tedious: funciona en Linux/Docker.
  return new sql.ConnectionPool({
    server: config.sql.server,
    port: config.sql.port,
    database: config.sql.database,
    user: config.sql.user,
    password: config.sql.password,
    options: {
      encrypt: config.sql.encrypt,
      trustServerCertificate: config.sql.trustServerCertificate,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  });
}

const pool = createPool();

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
  console.log(`[entrenamiento] SQL Server conectado (${config.sql.server}:${config.sql.port}/${config.sql.database})`);
}

module.exports = { sql, pool, connectSqlServer };
