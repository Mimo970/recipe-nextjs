import React, { useContext, useEffect, useState } from "react";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Sling as Hamburger } from "hamburger-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AuthContext } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import CustomDropdown from "../components/CustomDropdown";
import Search from "./Search";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { theme, setTheme } = useTheme();
  const [visible, setVisible] = useState(true);
  const { currentUser } = useContext(AuthContext);

  const foodCategories = [
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

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible, handleScroll]);

  return (
    <>
      <nav
        className={`${
          visible ? "" : "-translate-y-44"
        } transition-all duration-500 ease-in-out z-50 fixed w-full top-0 ${
          theme === "dark" ? "bg-zinc-900 shadow-md" : "bg-gray-300 shadow-md"
        } py-4 `}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href={"/"} style={{ textDecoration: "none" }}>
              <span
                className={` ${
                  theme === "dark" ? "text-zinc-300" : "text-black"
                } font-semibold text-2xl ml-2 `}
              >
                RecipeFinder
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="mr-6">
              <Search />
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`${
                theme === "dark"
                  ? " bg-[#181818] hover:bg-zinc-700 border-2 border-zinc-700"
                  : " bg-zinc-300 hover:bg-zinc-400  border-2 border-[#000000]"
              } text-white p-1 rounded`}
            >
              {theme === "dark" ? (
                <MdOutlineLightMode
                  color={theme === "dark" ? "#52525b" : "#023020"}
                  size={25}
                />
              ) : (
                <MdOutlineDarkMode
                  color={theme === "dark" ? "#52525b" : "#023020"}
                  size={25}
                />
              )}
            </button>
            <div className="md:hidden">
              <Hamburger
                rounded
                toggled={isOpen}
                toggle={setIsOpen}
                size={20}
                color={theme === "dark" ? "#52525b" : "#023020"}
              />
            </div>
            <div className="px-2 cursor-pointer">
              <CustomDropdown user={currentUser}></CustomDropdown>
            </div>
          </div>
        </div>

        <div
          className={` ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"} ${
            isOpen ? "block" : "hidden"
          } md:hidden px-4 py-2`}
        >
          {foodCategories.map((category) => (
            <Link legacyBehavior href={`/${category}`} key={category}>
              <a className="block text-black text-lg py-2">{category}</a>
            </Link>
          ))}
        </div>

        <div className="hidden md:block container mx-auto flex justify-center">
          {foodCategories.map((category) => (
            <Link legacyBehavior href={`/${category}`} key={category}>
              <a
                className={`${
                  theme === "dark" ? "text-zinc-400" : "text-black"
                } text-lg mx-4`}
              >
                {category}
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
