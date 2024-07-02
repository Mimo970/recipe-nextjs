import React, { useContext, useEffect, useState } from "react";

import { FavoriteRecipesContext } from "../contexts/FavoritesContext";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { AuthContext } from "../contexts/AuthContext";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import arrayData from "../utils/data";
import { useTheme } from "next-themes";
const Similiar = () => {
  const [similiarRecipes, setSimiliarRecipes] = useState(arrayData);
  const { theme, setTheme } = useTheme();
  const [clickedRecipes, setClickedRecipes] = useState([]);
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState([]);
  const { favoriteRecipes, setFavoriteRecipes } = useContext(
    FavoriteRecipesContext
  );
  const { currentUser } = useContext(AuthContext);

  // useEffect(() => {
  //   setSimiliarRecipes(arrayData);
  // }, [similiarRecipes]);

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
    const favoriteRecipe = similiarRecipes.find(
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

  console.log(favoriteRecipes);

  return (
    <div className="bg-zinc-200 rounded-3xl container mx-auto p-8">
      <Splide
        options={{
          perPage: 5,
          arrows: true,
          pagination: false,
          drag: "free",
          gap: "1rem",
        }}
      >
        {arrayData[0]?.map((item, index) => {
          const isFavorited = userFavoriteRecipes.some(
            (recipe) => recipe.id === item.id
          );

          return (
            <SplideSlide key={index}>
              <div className="w-full bg-zinc-300 rounded-lg   overflow-hidden">
                <img
                  className="w-full h-auto object-cover"
                  src={item.image}
                  alt="vegetarian food"
                />
                <span
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer"
                  onClick={() => handleFavorite(item.id)}
                >
                  {/* {isFavorited ||
                  favoriteRecipes.some(
                    (clickedRecipe) => clickedRecipe.id === item.id
                  ) ? (
                    <AiFillHeart color="#FF69B4" size={30} />
                  ) : (
                    <AiOutlineHeart color="#FF69B4" size={30} />
                  )} */}
                </span>
                <div className="p-4">
                  <p className="font-bold text-lg mb-2">
                    Recipe {index + 1} Title
                  </p>
                  <p className="text-gray-700 text-base">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </SplideSlide>
          );
        })}
      </Splide>
    </div>
  );
};

export default Similiar;
