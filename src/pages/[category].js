import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useTheme } from "next-themes";
import { FavoriteRecipesContext } from "../../contexts/FavoritesContext";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { AuthContext } from "../../contexts/AuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

function Cuisine({ cuisine }) {
  const router = useRouter();
  const { category } = router.query;
  const { theme, setTheme } = useTheme();
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState([]);
  const { favoriteRecipes, setFavoriteRecipes } = useContext(
    FavoriteRecipesContext
  );
  const [clickedRecipes, setClickedRecipes] = useState([]);
  const { currentUser } = useContext(AuthContext);

  // console.log(category);

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
    const favoriteRecipe = cuisine.find((recipe) => recipe.id === recipeId);
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
    if (!currentUser?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
      const data = doc.data();
      if (data && data.favoriteRecipes) {
        setFavoriteRecipes(data.favoriteRecipes);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  console.log(cuisine);

  return (
    <>
      <Layout>
        <div
          className={`h-screen ${
            theme === "dark" ? "bg-[#242526]" : "bg-zinc-100"
          } p-4 grid grid-cols-1 mt-32`}
        >
          <span
            className={`text-3xl font-semibold col-span-full ${
              theme === "dark" ? "text-zinc-400" : "text-zinc-800"
            }   text-center mb-4`}
          >
            {category}
          </span>

          <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center col-start-1 row-start-2">
            {cuisine?.map((item) => {
              const isFavorited = userFavoriteRecipes.some(
                (recipe) => recipe.id === item.id
              );
              return (
                <div
                  key={item.id}
                  className={` ${
                    theme === "dark"
                      ? "bg-[#181818] shadow-md"
                      : "bg-zinc-300 border-none shadow-md"
                  } h-full rounded-lg shadow-md relative max-w-sm`}
                >
                  <div className="aspect-w-1 aspect-h-1 block rounded-t-lg overflow-hidden">
                    <img
                      className="object-cover w-full "
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
                  </div>

                  <div className="p-4">
                    <h4
                      className={`text-lg font-medium mb-2 ${
                        theme === "dark" ? "text-zinc-400" : "text-zinc-800"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <div className="flex items-center">
                      <Link legacyBehavior href={"recipe/" + item.id}>
                        <span className="text-gray-600 text-sm cursor-pointer hover:underline">
                          View Recipe
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Cuisine;

export async function getStaticProps({ params }) {
  const { category } = params;
  const results = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.REACT_APP_API_KEY}&cuisine=${category}&number=12`
  ).then((res) => res.json());
  return {
    props: {
      cuisine: results?.results ?? null,
    },
  };
}

export async function getStaticPaths() {
  const cuisines = [
    "Italian",
    "Chinese",
    "American",
    "Thai",
    "Japanese",
    "Mexican",
    "Greek",
    "Indian",
    "German",
  ];

  // const cuisines = await fetch(
  //   `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.REACT_APP_API_KEY}&cuisine=${category}&number=12`
  // ).then((res) => res.json());

  return {
    paths: cuisines.map((cuisine) => ({
      params: {
        category: cuisine,
      },
    })),
    fallback: false,
  };
}
