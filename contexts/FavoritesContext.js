import { createContext, useContext, useState } from "react";

// Create the context
export const FavoriteRecipesContext = createContext();

export const FavoriteRecipesProvider = ({ children }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  const toggleFavoriteRecipe = (recipe) => {
    if (favoriteRecipes.find((r) => r.id === recipe.id)) {
      setFavoriteRecipes(favoriteRecipes.filter((r) => r.id !== recipe.id));
    } else {
      setFavoriteRecipes([...favoriteRecipes, recipe]);
    }
  };

  return (
    <FavoriteRecipesContext.Provider
      value={{ favoriteRecipes, setFavoriteRecipes, toggleFavoriteRecipe }}
    >
      {children}
    </FavoriteRecipesContext.Provider>
  );
};
