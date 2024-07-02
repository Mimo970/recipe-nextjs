import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { AiOutlineHeart, AiOutlineLike, AiFillHeart } from "react-icons/ai";
import { FavoriteRecipesContext } from "../contexts/FavoritesContext";
import { db } from "../firebase";
import { AuthContext } from "../contexts/AuthContext";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import Similiar from "./Similiar";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";

const Popular = () => {
  const [popularItems, setPopularItems] = useState([]);
  const { theme, setTheme } = useTheme();
  const [clickedRecipes, setClickedRecipes] = useState([]);
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState([]);
  const { favoriteRecipes, setFavoriteRecipes } = useContext(
    FavoriteRecipesContext
  );
  const { currentUser } = useContext(AuthContext);

  const fetchFavoriteRecipes = async (uid) => {
    if (uid) {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserFavoriteRecipes(docSnap.data().favoriteRecipes);
      } else {
        console.log("No such document!");
      }
    }
  };

  useEffect(() => {
    fetchFavoriteRecipes(currentUser.uid);
  }, [favoriteRecipes]);

  useEffect(() => {
    async function setPopularRecipes() {
      let localRecipes = localStorage.getItem("popular");
      if (localRecipes) {
        let localJSON = JSON.parse(localRecipes);
        setPopularItems(localJSON);
      } else {
        let response = await fetch(
          `https://api.spoonacular.com/recipes/random?apiKey=4badb335b6834767934dec71cd7f31aa&number=20`
        );
        let responseJson = await response.json();
        let apiRecipies = responseJson.recipes;
        setPopularItems(apiRecipies);
        localStorage.setItem("popular", JSON.stringify(apiRecipies));
      }
    }
    setPopularRecipes();
  }, []);

  const updateFavoriteRecipes = async (userId, favoriteRecipes) => {
    await updateDoc(doc(db, "users", userId), {
      // date: Timestamp.now(),
      favoriteRecipes: favoriteRecipes,
    })
      .then(() => {
        console.log("Favorite recipes updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating favorite recipes: ", error);
      });
  };

  const handleFavorite = (recipeId) => {
    const favoriteRecipe = popularItems.find(
      (recipe) => recipe.id === recipeId
    );
    const isFavorited = favoriteRecipes.some(
      (recipe) => recipe.id === recipeId
    );
    if (!isFavorited) {
      setClickedRecipes((prevState) => [...prevState, recipeId]);
      const updatedFavoriteRecipes = [...favoriteRecipes, favoriteRecipe];
      setFavoriteRecipes(updatedFavoriteRecipes);
      updateFavoriteRecipes(currentUser.uid, updatedFavoriteRecipes);
    } else {
      setClickedRecipes((prevState) =>
        prevState.filter((id) => id !== recipeId)
      );
      const updatedFavoriteRecipes = favoriteRecipes.filter(
        (recipe) => recipe.id !== recipeId
      );
      setFavoriteRecipes(updatedFavoriteRecipes);
      updateFavoriteRecipes(currentUser.uid, updatedFavoriteRecipes);
    }
  };

  useEffect(() => {
    if (!currentUser.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
      const data = doc.data();
      if (data && data.favoriteRecipes) {
        setFavoriteRecipes(data.favoriteRecipes);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  console.log(favoriteRecipes, clickedRecipes);

  return (
    <>
      <div
        className={`${
          theme === "dark" ? "bg-[#242526]" : "bg-zinc-100 "
        } py-8 pt-28`}
      >
        <div className="container mx-auto">
          <h3
            className={`text-3xl font-semibold my-4 ${
              theme === "dark" ? "text-zinc-300" : " "
            }`}
          >
            Popular Recipes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularItems.map((item) => {
              const isFavorited = userFavoriteRecipes.some(
                (recipe) => recipe.id === item.id
              );
              return (
                <div
                  key={item.id}
                  className={`${
                    theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"
                  } rounded-lg shadow-md p-2 relative`}
                >
                  <img
                    className="object-cover w-full h-48 rounded-t-lg"
                    src={item.image}
                    alt={item.title}
                  />
                  <span
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer"
                    onClick={() => handleFavorite(item.id)}
                  >
                    {isFavorited ||
                    favoriteRecipes.some(
                      (clickedRecipe) => clickedRecipe.id === item.id
                    ) ? (
                      <AiFillHeart color="#FF69B4" size={30} />
                    ) : (
                      <AiOutlineHeart color="#FF69B4" size={30} />
                    )}
                  </span>
                  <div className="p-4">
                    <Link
                      style={{ color: "#000000", textDecoration: "none" }}
                      href={"recipe/" + item.id}
                    >
                      <h4
                        className={`${
                          theme === "dark" ? "text-zinc-300" : " "
                        } text-lg font-medium mb-2`}
                      >
                        {item.title}
                      </h4>
                    </Link>
                    <div className="flex items-center ">
                      <AiOutlineLike
                        color={theme === "dark" ? "#52525b" : "#023020"}
                      />
                      &nbsp;
                      <span
                        className={`${
                          theme === "dark" ? "text-zinc-300" : " "
                        } text-sm`}
                      >
                        {item.aggregateLikes} likes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Popular;
