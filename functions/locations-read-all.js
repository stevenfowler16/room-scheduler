/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query


exports.handler = (event, context) => {
  console.log('Function `locations-read-all` invoked')
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
  }) 
  return client.query(q.Paginate(q.Match(q.Ref('indexes/all_locations'))))
    .then((response) => {
      const locationRefs = response.data
      console.log('location refs', locationRefs)
      console.log(`${locationRefs.length} locations found`)
      // create new query out of todo refs. http://bit.ly/2LG3MLg
      const getAllLocationDataQuery = locationRefs.map((ref) => {
        return q.Get(ref)
      })
      // then query the refs
      return client.query(getAllLocationDataQuery).then((ret) => {
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
