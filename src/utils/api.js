/* Api methods to call /functions */

const create = (data) => {
  return fetch('/.netlify/functions/locations-create', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const readAll = () => {
  return fetch('/.netlify/functions/locations-read-all').then((response) => {
    return response.json()
  })
}

const update = (locationId, data) => {
  return fetch(`/.netlify/functions/locations-update/${locationId}`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const deleteTodo = (locationId) => {
  return fetch(`/.netlify/functions/locations-delete/${locationId}`, {
    method: 'POST',
  }).then(response => {
    return response.json()
  })
}

const batchDeleteTodo = (todoIds) => {
  return fetch(`/.netlify/functions/todos-delete-batch`, {
    body: JSON.stringify({
      ids: todoIds
    }),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

export default {
  create: create,
  readAll: readAll,
  update: update,
  delete: deleteTodo,
  batchDelete: batchDeleteTodo
}
