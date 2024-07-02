import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Search = () => {
  const { theme, setTheme } = useTheme();

  const router = useRouter();

  const [input, setInput] = useState("");

  const notify = () =>
    toast.error("Please fill out this field!", {
      duration: 4000,
      position: "top-right",
    });

  const submitHandler = (e) => {
    if (input === "") {
      e.preventDefault();

      notify();
    } else {
      e.preventDefault();
      router.push("/searched/" + input);
    }
  };

  const changeHandler = (e) => {
    setInput(e.target.value);
  };

  return (
    <form onSubmit={submitHandler}>
      <Toaster />
      <input
        onChange={changeHandler}
        className={`rounded-full py-2 px-4 ${
          theme === "dark"
            ? "bg-zinc-700 text-zinc-400 dark-input"
            : "bg-zinc-100 text-black"
        } text-black focus:outline-none`}
        type="search"
        name="search"
        placeholder="Search"
      />
    </form>
  );
};

export default Search;
