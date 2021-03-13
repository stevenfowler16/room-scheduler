/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = (event, context) => {
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
  }) 
  const data = JSON.parse(event.body)
  const id = data;
  console.log(`Function 'event-search' invoked. Read id: ${id}`)
  return client.query(
      q.Map(
        q.Paginate(
            q.Match(q.Index(`occasions_search_by_location`),`292953679655338499`)
            ),
            q.Lambda("occasions",q.Get(q.Var("occasions")))
        )
    )
    .then((response) => {
      console.log('success', response.data)
      return {
        statusCode: 200,
        body: JSON.stringify(response.data)
      }
    }).catch((error) => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}
