import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, database, ref, get } from "@/hooks/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkUserProfile(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserProfile = async (uid: string) => {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userDetails = snapshot.val();
      if (!userDetails.fullName || !userDetails.address || !userDetails.idURL) {
        setIsProfileComplete(false);
      } else {
        setIsProfileComplete(true); 
      }
    } else {
      setIsProfileComplete(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProtectedRoute = (route: string) => {
    if (!user) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    } else if (!isProfileComplete) {
      alert("Please complete your profile to access this page.");
      navigate("/login"); 
    } else {
      navigate(route);
    }
  };

  return (
    <nav className="bg-primary text-primary-foreground w-screen shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:underline">
          Fractiona
        </Link>
        <div className="space-x-4 flex items-center">
          <button
            onClick={() => handleProtectedRoute("/browse")}
            className="hover:underline"
          >
            Browse Assets
          </button>
          <button
            onClick={() => handleProtectedRoute("/tokenize")}
            className="hover:underline"
          >
            Tokenize Asset
          </button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar>
                    <AvatarImage
                      src={user.photoURL || ""}
                      alt={user.displayName || "User Avatar"}
                    />
                    <AvatarFallback>
                      {user.displayName
                        ? user.displayName[0].toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
