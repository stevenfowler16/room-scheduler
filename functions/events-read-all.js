/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query


exports.handler = (event, context) => {
  console.log('Function `events-read-all` invoked')
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
  }) 
  return client.query(q.Paginate(q.Match(q.Ref('indexes/all_occasions'))))
    .then((response) => {
      const eventRefs = response.data
      console.log('event refs', eventRefs)
      console.log(`${eventRefs.length} events found`)
      // create new query out of todo refs. http://bit.ly/2LG3MLg
      const getAllEventDataQuery = eventRefs.map((ref) => {
        return q.Get(ref)
      })
      // then query the refs
      return client.query(getAllEventDataQuery).then((ret) => {
        return {
          statusCode: 200,
          body: JSON.stringify(ret)
        }
      })
    }).catch((error) => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}
