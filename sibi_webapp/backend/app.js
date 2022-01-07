const neo4j = require('neo4j-driver')

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "p"));
const session = driver.session()
try {
    const result = await session.run(
        'MATCH (a:$cat) RETURN a LIMIT 10', {
            cat: 'Bodegas'
        }
    )
    const bodegas = result.records
} finally {
    await session.close()
}
await driver.close()