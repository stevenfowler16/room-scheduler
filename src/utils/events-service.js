
const create = (data) => {
    return fetch('/.netlify/functions/events-create', {
      body: JSON.stringify(data),
      method: 'POST'
    }).then(response => {
      return response.json()
    });
}


export default {
    create:create
}