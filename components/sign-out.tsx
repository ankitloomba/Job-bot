"use client";
import { signOut } from "next-auth/react";
export default function SignOut(){return <button className="ghost" onClick={()=>signOut({callbackUrl:"/login"})}>Log out</button>}
