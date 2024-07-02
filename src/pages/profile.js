import { useState, useEffect, useContext } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../contexts/AuthContext";
import Layout from "../../components/Layout";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "next-themes";
import { Router, useRouter } from "next/router";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLike,
  AiOutlineMinusCircle,
  AiFillMinusCircle,
} from "react-icons/ai";
import Link from "next/link";
import { FavoriteRecipesContext } from "../../contexts/FavoritesContext";

const Profile = () => {
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState([]);
  const [clickedRecipes, setClickedRecipes] = useState([]);
  const { favoriteRecipes, setFavoriteRecipes } = useContext(
    FavoriteRecipesContext
  );
  const { currentUser } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const Router = useRouter();

  const backtoHome = (e) => {
    e.preventDefault();

    Router.push("/");
  };

  const fetchFavoriteRecipes = async (uid) => {
    if (uid) {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFavoriteRecipes(docSnap.data().favoriteRecipes);
      } else {
        console.log("No such document!");
      }
    }
  };
  useEffect(() => {
    fetchFavoriteRecipes(currentUser.uid);
  }, []);

  const updateFavoriteRecipes = async (userId, favoriteRecipes) => {
    await updateDoc(doc(db, "users", currentUser.uid), {
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
    const favoriteRecipe = favoriteRecipes.find(
      (recipe) => recipe.id === recipeId
    );
    const isFavorited = favoriteRecipes.some(
      (recipe) => recipe.id === recipeId
    );
    if (!isFavorited) {
      setClickedRecipes((prevState) => [...prevState, recipeId]);
      setFavoriteRecipes((prevState) => [...prevState, favoriteRecipe]);
      updateFavoriteRecipes(currentUser.uid, [
        ...favoriteRecipes,
        favoriteRecipe,
      ]);
    } else {
      setClickedRecipes((prevState) =>
        prevState.filter((id) => id !== recipeId)
      );
      setFavoriteRecipes((prevState) =>
        prevState.filter((recipe) => recipe.id !== recipeId)
      );
      updateFavoriteRecipes(
        currentUser.uid,
        favoriteRecipes.filter((recipe) => recipe.id !== recipeId)
      );
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

  console.log(favoriteRecipes);

  return (
    <Layout>
      <div
        className={`py-48  h-screen
        ${theme === "dark" ? "bg-[#242526]" : "bg-zinc-200 "}
          `}
      >
        <div
          className={` flex flex-col max-w-7xl mx-auto  ${
            theme === "dark" ? "bg-zinc-700" : "bg-zinc-300 "
          } p-4 rounded-lg `}
        >
          <div className="flex justify-between">
            <h1
              className={`text-3xl ${
                theme === "dark" ? "text-zinc-300" : " "
              }  font-bold mb-4`}
            >
              My Account
            </h1>
            <span className="cursor-pointer" onClick={backtoHome}>
              <div className="flex flex-col items-center">
                <MdOutlineCancel color="gray" size={40} />
                <span>ESC</span>
              </div>
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4  flex-grow">
            <div className="w-full md:w-1/4">
              <h1
                className={`text-lg font-bold  ${
                  theme === "dark" ? "text-zinc-300" : " "
                }`}
              >
                Preview
              </h1>
              <div
                className={` ${
                  theme === "dark"
                    ? "border-2 rounded border-zinc-500"
                    : "border-2 rounded border-zinc-400"
                } p-4`}
              >
                <img
                  className="rounded-full w-11 h-11 object-center"
                  src={currentUser?.photoURL}
                  alt=""
                />

                <div className="mt-4">
                  <h2
                    className={`text-lg ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-700 "
                    } font-bold`}
                  >
                    Username
                  </h2>
                  <p className="text-gray-500">@{currentUser?.displayName}</p>
                </div>
                <div className="mt-4">
                  <h2
                    className={`text-lg ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-700 "
                    } font-bold`}
                  >
                    Email
                  </h2>
                  <p className="text-zinc-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-3/4 ">
              <div
                className={`${
                  theme === "dark"
                    ? "border-2 rounded border-zinc-500"
                    : "border-2 rounded border-zinc-400"
                } p-2 flex-grow flex-col gap-1`}
              >
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    theme === "dark" ? "text-zinc-300" : " "
                  }`}
                >
                  All Saved Recipes
                </h2>
                <div>
                  <h1 className={`${theme === "dark" ? "text-zinc-300" : " "}`}>
                    {favoriteRecipes.length} item
                    {favoriteRecipes.length > 1 || favoriteRecipes < 1
                      ? "s"
                      : ""}
                  </h1>
                  <div>
                    <div className="  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {favoriteRecipes.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className={`${
                              theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"
                            } rounded-lg   shadow-md p-2 relative w-full h-full`}
                          >
                            <img
                              className="object-cover w-full h-48 rounded-t-lg"
                              src={item.image}
                              alt={item.title}
                            />
                            <span
                              className="absolute top-2 rounded-full right-2 bg-red-500 cursor-pointer"
                              onClick={() => handleFavorite(item.id)}
                            >
                              <AiFillMinusCircle size={30} color="white" />
                            </span>
                            <div className="p-4">
                              <Link href={"recipe/" + item.id}>
                                <h4
                                  className={`${
                                    theme === "dark" ? "text-zinc-300" : " "
                                  } text-lg font-medium mb-2`}
                                >
                                  {item.title}
                                </h4>
                              </Link>
                              <div className="flex items-center">
                                <AiOutlineLike
                                  color={
                                    theme === "dark" ? "#52525b" : "#023020"
                                  }
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
