import { API_URL, RES_PER_PAGE, KEY } from './config.js'
import { AJAX } from './helpers.js'
// import { getJSON, sendJSON } from './helpers.js'

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
}

const createRecipeObject = function (data) {
  const { recipe } = data.data
  return {
    id: recipe.id,
    cookingTime: recipe.cooking_time,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    source: recipe.source_url,
    title: recipe.title,
    ...(recipe.key && { key: recipe.key }),
  }
}

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`)
    state.recipe = createRecipeObject(data)

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true
    else state.recipe.bookmarked = false

    console.log(state.recipe)
  } catch (err) {
    console.log(err)
    throw err
  }
}

// Search Results
export const loadSearchResult = async function (query) {
  try {
    state.search.query = query
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)
    console.log(data)

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      }
    })
    state.search.page = 1
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page
  const start = (page - 1) * state.search.resultsPerPage // 0
  const end = page * state.search.resultsPerPage // 9

  return state.search.results.slice(start, end)
}

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings
    // newQt = oldQt * newServing / oldServing // 2 * 8 / 4 = 4
  })

  state.recipe.servings = newServings
}

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmarks = function (recipe) {
  // Add Bookmark
  state.bookmarks.push(recipe)

  // Mark current recipe as a bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true

  persistBookmark()
}

export const deleteBookmarks = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id)
  state.bookmarks.splice(index, 1)

  // Mark current recipe as not a bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false

  persistBookmark()
}

const init = function () {
  const storage = localStorage.getItem('bookmarks')
  if (storage) state.bookmarks = JSON.parse(storage)
}

init()

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim())
        if (ingArr.length !== 3) {
          throw new Error(
            'Wrong ingredient format!! Please use the correct format ;)'
          )
        }
        const [quantity, unit, description] = ingArr
        return { quantity: quantity ? +quantity : null, unit, description }
      })

    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      image_url: newRecipe.image,
      source_url: newRecipe.sourceUrl,
      ingredients,
    }

    console.log(newRecipe)

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe)
    state.recipe = createRecipeObject(data)
    addBookmarks(state.recipe)
  } catch (err) {
    throw err
  }
}
