import { signOut } from "firebase/auth";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useContext, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import { auth } from "../firebase";
import { useRouter } from "next/router";

function CustomDropdown({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(auth).then(() => {
      router.push("/login");
    });
  };

  return (
    <div className="d-inline-block">
      <img
        className="w-12 rounded-full border-2 border-zinc-500"
        src={user?.photoURL}
        alt="Dropdown Image"
        onClick={() => setShowDropdown(!showDropdown)}
      />
      <Dropdown.Menu
        style={{
          backgroundColor: theme === "dark" ? "#3f3f46" : "#a1a1aa",
        }}
        show={showDropdown}
        className="dropdown-menu-right"
      >
        <Dropdown.Item
          style={{
            color: theme === "dark" ? "#a1a1aa" : "#27272a",
          }}
          href={`/profile`}
          className="d-flex align-items-start"
        >
          <Link
            className={`${
              theme === "dark"
                ? "text-zinc-400 no-underline"
                : "text-black no-underline"
            } `}
            href={`/profile`}
          >
            Profile
          </Link>
        </Dropdown.Item>
        <Dropdown.Item
          style={{
            color: theme === "dark" ? "#a1a1aa" : "#27272a",
          }}
          // href="/login"
        >
          <button onClick={handleSignOut}>Sign Out</button>
        </Dropdown.Item>
        {/* <Dropdown.Item href="#action/3">Action 3</Dropdown.Item> */}
      </Dropdown.Menu>
    </div>
  );
}

export default CustomDropdown;
