import {
  type User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "../lib/firebase";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Store uid globally so LoginPage can access it synchronously
        (window as { __instiflow_uid?: string }).__instiflow_uid =
          firebaseUser.uid;
        localStorage.setItem(
          "instiflow_user",
          JSON.stringify({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          }),
        );
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      // Store uid globally for immediate access
      (window as { __instiflow_uid?: string }).__instiflow_uid = u.uid;
      localStorage.setItem(
        "instiflow_user",
        JSON.stringify({
          uid: u.uid,
          name: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        }),
      );
      setUser(u);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("instiflow_user");
    (window as { __instiflow_uid?: string }).__instiflow_uid = undefined;
    setUser(null);
  };

  return { signInWithGoogle, signOut, user, isLoading, error };
}
