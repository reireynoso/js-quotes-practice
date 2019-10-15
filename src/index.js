// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 
let currentQuote
let currentElement

const quoteListUL = document.querySelector('#quote-list')
const editQuoteForm = document.querySelector('#edit-quote-form')
editQuoteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // debugger
    const editQuoteValue = e.target["edit-quote"].value
    const editAuthorValue = e.target["edit-author"].value
    fetch(`http://localhost:3000/quotes/${currentQuote.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            quote: editQuoteValue,
            author: editAuthorValue,
        })
    })
    .then(resp => resp.json())
    .then(quote => {
        // console.log('newQuoute',quote)
        // debugger
        currentElement.querySelector(".blockquote").querySelector(".mb-0").innerText = quote.quote
        currentElement.querySelector(".blockquote").querySelector(".blockquote-footer").innerText = quote.author
    })
})

const newQuoteForm = document.getElementById('new-quote-form')
newQuoteForm.addEventListener('submit', (e) => {
    // debugger
    e.preventDefault()
    // console.log('did not refresh')
    const newQuoteValue = e.target["new-quote"].value
    const newQuoteAuthor = e.target["author"].value
    fetch(`http://localhost:3000/quotes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            quote: newQuoteValue,
            author: newQuoteAuthor,
        })
    })
    .then(resp => resp.json())
    .then(quote => {
        // console.log('newQuoute',quote)
        createFetchQuotes(quote)
    })
})
fetchQuotes()

//middleman to get the likes array
function createFetchQuotes(quote){
    // console.log(quote)
    fetch(`http://localhost:3000/quotes?_embed=likes`)
    .then(resp => resp.json())
    .then(quotes => {
        let foundQuote = quotes.find(newQuote => {
            return newQuote.id === quote.id
        })
        createElement(foundQuote)
    })
}

function fetchQuotes(){
    fetch(`http://localhost:3000/quotes?_embed=likes`)
    .then(resp => resp.json())
    .then(quotes => {
        quotes.forEach(quote => {
            createElement(quote)
        })
    })
}

function createElement(quote){
    // console.log(quote)
    const li = document.createElement('li')
    li.className = "quote-card"
    li.innerHTML = `<li class='quote-card'>
    <blockquote class="blockquote">
      <p class="mb-0">${quote.quote}</p>
      <footer class="blockquote-footer">${quote.author}</footer>
      <br>
      <button data-id=${quote.id} class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
      <button data-id=${quote.id} class='btn-danger'>Delete</button>
      <button data-id=${quote.id} class='btn-success edit'>Edit</button>
    </blockquote>
  </li>`
  li.addEventListener('click', (e) => {
      if(e.target.className === "btn-danger"){
          
          fetch(`http://localhost:3000/quotes/${quote.id}`, {
              method: "DELETE"
          })
          .then(resp => resp.json())
          .then(deleteConfirm => {
            e.target.parentElement.parentElement.remove()
          })
      }
      else if(e.target.className === "btn-success"){
          const like = parseInt(event.target.firstElementChild.innerText)
          let newLikeAmount = like + 1
          fetch(`http://localhost:3000/likes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                  quoteId: quote.id
              })
          })
          .then(resp => resp.json())
          .then(data => {
              quote.likes.push(data)
              e.target.children[0].innerText = quote.likes.length     
          })
      }
      else if(e.target.className === "btn-success edit"){
          const editQuote = document.querySelector('#edit-quote')
          const editAuthor = document.querySelector('#edit-author')
          editQuote.value = quote.quote
          editAuthor.value = quote.author
          currentQuote = quote
          currentElement = li
      }
  })
  quoteListUL.append(li)
}