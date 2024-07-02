import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import { auth, storage, db } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

const RegisterPage = () => {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState("");
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "The email address is already in use by another account.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      case "auth/weak-password":
        return "The password is too weak. Please use a stronger password.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const storageRef = ref(storage, displayName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          const errorCode = error.code;
          const errorMessage = getFriendlyErrorMessage(errorCode);
          setError(errorMessage);
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            await updateProfile(response.user, {
              displayName,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "users", response.user.uid), {
              uid: response.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
              favoriteRecipes: [],
            });
          });
          router.push("/");
        }
      );
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = getFriendlyErrorMessage(errorCode);
      setError(errorMessage);
      console.log(error);
    }
  };

  return (
    <div className="bg-zinc-800  text-white h-screen flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-700 w-96 p-6 rounded-lg shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>

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
        <div className="mb-4">
          <label htmlFor="username" className="block font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border border-gray-400 p-2 w-full bg-zinc-400"
          />
        </div>

        <div className="mb-4">
          <input
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
            required
            type="file"
            id="file"
          />

          <label className="flex items-center" htmlFor="file">
            <MdAddPhotoAlternate />
            <span>Add an avatar</span>
          </label>
        </div>
        <button
          type="submit"
          className="bg-zinc-500 text-white p-2 rounded-lg hover:bg-zinc-600"
        >
          Register
        </button>

        {error && <div className="text-red-500 mt-2">{error}</div>}

        <p>
          Already have an account? &nbsp;
          <Link href="/login">
            <span className="underline underline-offset-1 text-sky-600">
              Sign In
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
