import{database}from'../server/db';
import{initialTournament}from'../lib/tournament';
const sql=database();const schema=await sql`SELECT current_database() AS name`;
if(schema[0].name!=='tanvir_ovi_test')throw new Error('Refusing to reset a non-test database.');
await sql.transaction([sql`DELETE FROM owner_sessions`,sql`DELETE FROM owner_attempts`,sql`DELETE FROM owner_account`,sql`DELETE FROM tournament_history`,sql`UPDATE tournament SET data=${JSON.stringify(initialTournament())}::jsonb,revision=0,updated_at=now() WHERE id=1`]);
console.log('Isolated test data reset.');
