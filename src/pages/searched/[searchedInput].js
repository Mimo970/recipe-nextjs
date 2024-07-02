import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSearchParams } from "next/router";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart, AiOutlineLike } from "react-icons/ai";
import Layout from "../../../components/Layout";
import { AuthContext } from "../../../contexts/AuthContext";
import { FavoriteRecipesContext } from "../../../contexts/FavoritesContext";
import { db } from "../../../firebase";
import Loading from "../loading";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import arrayData from "../../../utils/data";
import cors from "../../../middleware/cors";
const SearchedInput = () => {
  const [searchedRecipes, setSearchedRecipes] = useState([]);
  const [similiarRecipes, setSimiliarRecipes] = useState([]);
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState([]);
  const [clickedRecipes, setClickedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const { favoriteRecipes, setFavoriteRecipes } = useContext(
    FavoriteRecipesContext
  );
  const router = useRouter();
  const { searchedInput } = router.query;
  const { theme, setTheme } = useTheme();
  const getSearched = async (name) => {
    setLoading(true);
    const data = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.NEXT_PUBLIC_SPOONACULAR}&query=${name}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const recipes = await data.json();
    setSearchedRecipes(recipes.results);
    setLoading(false);
  };

  const getSimiliar = async (id) => {
    setLoading(true);
    const data = await fetch(
      `https://api.spoonacular.com/recipes/${id}/similiar?apiKey=4badb335b6834767934dec71cd7f31aa`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const recipes = await data.json();
    setSimiliarRecipes(recipes.results);
    setLoading(false);
  };

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    getSearched(searchedInput);
  }, [searchedInput]);

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
    const favoriteRecipe = searchedRecipes.find(
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
  console.log(similiarRecipes);

  return (
    <Layout>
      {loading ? (
        <div className=" flex justify-center pt-64 h-screen bg-zinc-300">
          <Loading />
        </div>
      ) : (
        <>
          <div
            className={`${
              theme === "dark" ? "bg-[#242526]" : "bg-zinc-100"
            } p-5  grid grid-cols-1 mt-24`}
          >
            {searchedRecipes.length < 1 ? (
              <>
                <h1 className="mx-auto">0 results found for your search.</h1>
                <div className="mx-auto">Please try another search term.</div>
              </>
            ) : (
              <span className="text-3xl font-semibold col-span-fll text-center mb-4">
                {searchedInput} results
              </span>
            )}

            <div className="max-w-screen-xl mx-auto  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center col-start-1 row-start-2">
              {searchedRecipes.length > 1 ? (
                searchedRecipes?.map((item) => {
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
                        {/* <h4 className="text-lg font-medium mb-2">
                          {item.title}
                        </h4> */}
                        <h4
                          className={`${
                            theme === "dark" ? "text-zinc-300" : " "
                          } text-lg font-medium mb-2`}
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
                })
              ) : (
                <div className=" h-screen "></div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default SearchedInput;

// export async function getStaticProps({ params }) {
//   const { searchedInput } = params;
//   const results = await fetch(
//     `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.REACT_APP_API_KEY}&query=${searchedInput}`
//   ).then((res) => res.json());
//   return {
//     props: {
//       searchedInput: results.results,
//     },
//   };
// }

// export async function getStaticPaths() {
//   const data = await fetch(
//     `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.REACT_APP_API_KEY}&query=${name}`,
//     {
//       Headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   const recipes = await data.json();

//   return {
//     paths: recipes.map((item) => ({
//       params: {
//         searchedInput: item,
//       },
//     })),
//     fallback: false,
//   };
// }
