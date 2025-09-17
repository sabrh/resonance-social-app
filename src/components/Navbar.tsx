import React from "react";
import { Link } from "react-router"; 
import { FaRegBell } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoHomeOutline } from "react-icons/io5";
import { TiMessages } from "react-icons/ti";

export default function Navbar() { 
  return ( 
    <div className="navbar bg-base-100 shadow px-8 md:px-18"> 
    <div className="navbar-start"> 
      <Link to="/" className="font-bold text-3xl">Resonance</Link> 
    </div> 

    <div className="navbar-center flex"> 
      <ul className="menu menu-horizontal px-1 md:gap-4"> 
        <li><Link to="/"><IoHomeOutline size={30}/></Link></li> 
        <li><Link to="/profile"><FaRegCircleUser size={30}/> </Link></li> 
        <li><Link to="/chats"><TiMessages size={30}/></Link></li> 
      </ul> 
    </div> 
    
    <div className="navbar-end gap-4"> 
      <Link to="/notifications"><FaRegBell size={30}/></Link> 
      <Link className="btn btn-outline rounded-full" to="/login">Login</Link> 
    </div> 
    </div> 
  ) 
}