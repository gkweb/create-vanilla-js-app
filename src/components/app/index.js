export default class App {

    constructor (elem) {
        if (elem) this.elem = elem
    }

    render () {
        const now = new Date();
        if (this.elem) this.elem.innerHTML = `
        <h1>App Component</h1>
        <p>Basic vanilla js app loaded</p>
        <p>The time is: ${now.toLocaleString()}</p>
        `
    }
}