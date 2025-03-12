"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button className=" bg-orange-300 px-3 py-1  rounded-md mt-2 " onClick={() => signIn()}>Sign in</button>
    </>
  );
}
