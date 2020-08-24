// Global app controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Likes from "./models/Likes";

// Global state of the app
/********
 *  - Search object
 *  - Current recipe object
 *  - Shopping list
 *  - Liked recipes
 */
const state = {};

/******
 * 
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput() /// TODO

  if (query) {
    // New search object and add to state
    state.search = new Search(query);
  }

  // 3) Prepare UI for results
  searchView.clearInput();
  searchView.clearResults();
  renderLoader(elements.searchRes);

  try {

 

  // 4) Search for recipes
  await state.search.getResults();

  // 5) Render results on UI
  clearLoader()
  searchView.renderResults(state.search.result)

} catch (error) {
  alert('Error processing search')
  clearLoader();
}
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage)
    }
})

/*****
 * 
 * Recipe Controller
 */

//  47746

const controlRecipe = async () => {
  // Get ID from URL
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) {
      searchView.highlightSelected(id)
    }

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients()
      
      // Calc servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        )
    } catch (err) {
      console.log('Error processing recipe', err)
    }
      
    }
}


// window.addEventListener('hashchange', controlRecipe)
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))

/***
 * LIST CONTROLLER
 */
const controlList = () => {
  // Create a new list if there is non yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient)
    listView.renderItem(item)
  })
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);

    // Handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val)
  }
})

/***
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // User has not yet liked the current recipe
  if (!state.likes.isLiked(currentID)) {
    // ADD LIKE TO THE STATE
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    )

    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to UI list
    likesView.renderLike(newLike)
    console.log(state.likes)

    // User has yet liked the current recipe
  } else {
    // REMOVE LIKE FROM THE STATE
    state.likes.deleteLike(currentID)

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like to UI list
    likesView.deleteLike(currentID)
    console.log(state.likes)
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes())
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes())

  // Render existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
})


// Handling receipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Decrease button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});
