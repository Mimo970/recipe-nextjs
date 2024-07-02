import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onSnapshot, doc } from "firebase/firestore";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  return { userData, loading };
};

export default useUserData;
