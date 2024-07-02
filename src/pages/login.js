import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import React, { useState } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import { auth, storage, db } from "../../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/user-disabled":
        return "The user corresponding to the given email has been disabled.";
      case "auth/user-not-found":
        return "There is no user corresponding to the given email.";
      case "auth/wrong-password":
        return "Invalid User Credentials.";
      case "auth/too-many-requests":
        return "Too many unsuccessful login attempts. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          router.push("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = getFriendlyErrorMessage(errorCode);
          setError(errorMessage); // Set the user-friendly error message
        });
    } catch (error) {
      setError("An unexpected error occurred. Please try again."); // Set a generic error message for unexpected errors
    }
  };

  return (
    <div className="bg-zinc-800 text-white h-screen flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-700 w-96 p-6 rounded-lg shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <div className="mb-4">
          <label htmlFor="email" className="block font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-zinc-400 p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-400 p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-zinc-500 text-white p-2 rounded-lg hover:bg-zinc-600"
        >
          Sign in
        </button>

        {error && <div className="text-red-500 mt-2">{error}</div>}

        <p className="mt-4">
          You don't have an account?&nbsp;
          <Link href="/register">
            <span className="underline underline-offset-1 text-sky-600">
              Register
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
