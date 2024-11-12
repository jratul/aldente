import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth/web-extension";
import { auth, store } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ account }) {
      try {
        // Create Google auth credential using id_token
        const googleCredential = GoogleAuthProvider.credential(
          account?.id_token,
        );

        // Sign in with credential
        const userCredential = await signInWithCredential(
          auth,
          googleCredential,
        ).catch(e => {
          console.log(e);
          return false; // Return false if sign-in fails
        });

        // If sign-in is successful, store user information in Firestore
        if (typeof userCredential !== "boolean") {
          const user = userCredential.user;

          // Firestore document reference for the user
          const userRef = doc(store, "users", user.uid);

          // Set user data in Firestore
          await setDoc(
            userRef,
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLogin: new Date().toISOString(),
            },
            { merge: true },
          ); // Merge true ensures only updated fields change
        }

        return userCredential ? true : false; // Return success or failure
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};
