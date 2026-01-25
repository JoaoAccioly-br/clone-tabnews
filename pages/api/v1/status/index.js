import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const resultVersion = await database.query("show server_version;");
  const databaseVersion = resultVersion.rows[0].server_version;
  const databaseMaxConnectionsResult = await database.query(
    "show max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;

  const databaseOpenedConnectionsResult = await database.query({
    text: "select count(*)::int from pg_stat_activity where datname = $1;",
    values: [databaseName],
  });

  const databaseOpennedConnectionValue =
    databaseOpenedConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: parseInt(databaseMaxConnectionsValue),
        used_connections: databaseOpennedConnectionValue,
      },
    },
  });
}

export default status;
