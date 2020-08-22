// Global app controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import { elements, renderLoader, clearLoader } from "./views/base";

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

  console.log(query)

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
  console.log(id)

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
      recipeView.renderRecipe(state.recipe)
    } catch (err) {
      console.log('Error processing recipe', err)
    }
      
    }
}


// window.addEventListener('hashchange', controlRecipe)
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))