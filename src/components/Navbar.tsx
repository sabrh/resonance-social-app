import { FaRegBell } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoHomeOutline } from "react-icons/io5";
import { TiMessages } from "react-icons/ti";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">Resonance</Link>
      </div>

      <div className="navbar-center flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/"><IoHomeOutline/></Link></li>
          <li><Link to="/profile"><FaRegCircleUser/> </Link></li>
          <li><Link to="/chats"><TiMessages/></Link></li>
        </ul>
      </div>

      <div className="navbar-end">
        <Link to="/notifications"><FaRegBell/></Link>
        <Link className="btn btn-outline rounded-full" to="/login">Login</Link>
      </div>
    </div>
    
  )
}