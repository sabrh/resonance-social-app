import { Link } from "react-router";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">Resonance</Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </div>
    </div>
  )
}