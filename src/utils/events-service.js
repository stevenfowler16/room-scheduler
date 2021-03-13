
const create = (data) => {
    return fetch('/.netlify/functions/events-create', {
      body: JSON.stringify(data),
      method: 'POST'
    }).then(response => {
      return response.json()
    });
}
const readAll = () => {
    return fetch('/.netlify/functions/events-read-all').then((response) => {
      return response.json()
    })
  }
  const deleteEvent = (eventsId) => {
    return fetch(`/.netlify/functions/events-delete/${eventsId}`, {
      method: 'POST',
    }).then(response => {
      return response.json()
    })
  }
  
export default {
    create:create,
    readAll:readAll,
    delete:deleteEvent
}