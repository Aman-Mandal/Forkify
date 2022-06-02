import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultView from './views/resultView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

// Babel : Polyfiling
import 'core-js/stable' // for JS things
import 'regenerator-runtime/runtime' // for async-await
import { MODAL_CLOSE_SEC } from './config.js'

// if (module.hot) {
//   module.hot.accept()
// }
const controlRecipe = async function () {
  try {
    // getting hash from search bar
    const id = window.location.hash.slice(1)

    if (!id) return
    recipeView.renderSpinner()

    // 0) Update results view to mark selected search result
    resultView.update(model.getSearchResultsPage())

    // 1) Loading Recipe
    await model.loadRecipe(id)

    // 2) Rendering Recipe
    recipeView.render(model.state.recipe)

    // 3) Update bookmarks view
    bookmarksView.update(model.state.bookmarks)
  } catch (err) {
    recipeView.renderError()
  }
}

const controlSearchResult = async function () {
  try {
    resultView.renderSpinner()
    // 1) Get search query
    const query = searchView.getQuery()
    if (!query) return

    // 2) load search results
    await model.loadSearchResult(query)

    // 3) Render search results
    resultView.render(model.getSearchResultsPage())

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.error(err)
  }
}

const controlPagination = function (goToPage) {
  // 1) Render new search results
  resultView.render(model.getSearchResultsPage(goToPage))

  // 2) Render new pagination buttons
  paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
  // 1) Update the recipe servings(in state)
  model.updateServings(newServings)

  // 2) Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function () {
  // 1) Add/Remove Bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe)
  else if (model.state.recipe.bookmarked)
    model.deleteBookmarks(model.state.recipe.id)

  // 2) Update recipe view
  recipeView.update(model.state.recipe)

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show Loading spinner
    addRecipeView.renderSpinner()

    // Upload new Recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    // Render recipe
    recipeView.render(model.state.recipe)

    // Success Message
    addRecipeView.renderMessage()

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks)

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error(err)
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipe)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResult)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}

init()
