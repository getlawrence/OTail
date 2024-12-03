import { ThemeToggle } from './ThemeToggle';
import { ModeToggle } from './ModeToggle';
import './Nav.css';

export const Nav = () => {
    return <>
        <h1>Tail Sampling Config Generator</h1>
        <div className='nav-toggles'>
            <ModeToggle />
            <ThemeToggle />
        </div>
    </>
}