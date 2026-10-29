/*
  Ejecuta este script en SSMS conectado con Windows Authentication,
  después de crear/seleccionar la base de datos GymFlow.
*/
IF OBJECT_ID(N'dbo.Workouts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Workouts (
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Workouts PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    FocusMuscle NVARCHAR(60) NOT NULL,
    Description NVARCHAR(500) NULL,
    DurationMinutes INT NOT NULL
      CONSTRAINT DF_Workouts_Duration DEFAULT 60,
    CreatedAt DATETIME2 NOT NULL
      CONSTRAINT DF_Workouts_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Workouts_Duration
      CHECK (DurationMinutes BETWEEN 1 AND 600)
  );

  CREATE UNIQUE INDEX UX_Workouts_Name ON dbo.Workouts(Name);
END;
