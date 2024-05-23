class Router {
    static instance;
    routes;
    constructor() {
        this.routes = {};
        window.addEventListener('popstate', this.handlePopState.bind(this));
        document.addEventListener('click', this.handleLinkClick.bind(this));
    }
    static getInstance() {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }
    /**
     *
     * @param path the path to navigate to
     * @param handler the function to call when the path is navigated to, this function should render the page
     */
    addRoute(path, handler) {
        this.routes[path] = handler;
    }
    /**
     *
     * @param path the path to navigate to
     * @param addToHistory whether to add the path to the browser history
     */
    navigateTo(path, addToHistory = true) {
        const handler = this.routes[path];
        if (handler) {
            // empty the body
            document.body.innerHTML = '';
            if (addToHistory) {
                history.pushState({ path }, '', path);
            }
            handler();
        }
        else {
            console.error(`No handler found for path: ${path}`);
        }
    }
    handlePopState(event) {
        const path = event.state?.path || '/';
        this.navigateTo(path, false);
    }
    handleLinkClick(event) {
        const target = event.target;
        if (target.tagName === 'A') {
            event.preventDefault();
            const href = target.getAttribute('href');
            if (href) {
                this.navigateTo(href);
            }
        }
    }
}
export default Router.getInstance();
//# sourceMappingURL=router.js.map