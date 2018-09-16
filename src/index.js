/**
 * The entry point
 */

 import App from './components/app/index'

window.addEventListener('load', () => {
    const app = new App(document.getElementById('app'))

    // Update every 1s
    setInterval(() => {
        app.render()
    }, 1000)
})