import { NavLink } from 'react-router-dom'
import styles from './navbar.module.css'

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <span className={styles.brand}>🎙️ Voice Billing AI</span>
      <div className={styles.links}>
        <NavLink to="/"         className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>Billing</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>Products</NavLink>
        <NavLink to="/history"  className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>History</NavLink>
      </div>
    </nav>
  )
}

export default Navbar