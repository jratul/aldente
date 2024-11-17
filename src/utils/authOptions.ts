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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ account }) {
      try {
        const googleCredential = GoogleAuthProvider.credential(
          account?.id_token,
        );

        const userCredential = await signInWithCredential(
          auth,
          googleCredential,
        ).catch(e => {
          console.log(e);
          return false;
        });

        if (typeof userCredential !== "boolean") {
          const user = userCredential.user;

          const userRef = doc(store, "users", user.uid);

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
          );
        }

        return userCredential ? true : false;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  },
};
