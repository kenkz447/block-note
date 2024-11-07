import { useAuthContext } from "./useAuthContext";

export const useCurrentUser = () => {
  const { currentUser, signOut } = useAuthContext();

  return {
    currentUser,
    signOut
  };
}
