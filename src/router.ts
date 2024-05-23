class Router {
    private static instance: Router;
    private routes: { [key: string]: () => void };

    private constructor() {
        this.routes = {};
        window.addEventListener('popstate', this.handlePopState.bind(this));
        document.addEventListener('click', this.handleLinkClick.bind(this));
    }

    static getInstance(): Router {
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
    addRoute(path: string, handler: () => void) {
        this.routes[path] = handler;
    }

    /**
     * 
     * @param path the path to navigate to
     * @param addToHistory whether to add the path to the browser history
     */
    navigateTo(path: string, addToHistory = true) {
        const handler = this.routes[path];
        if (handler) {
            // empty the body
            document.body.innerHTML = '';

            if (addToHistory) {
                history.pushState({ path }, '', path);
            }
            handler();

        } else {
            console.error(`No handler found for path: ${path}`);
        }
    }

    handlePopState(event: PopStateEvent) {
        const path = event.state?.path || '/';
        this.navigateTo(path, false);
    }

    handleLinkClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
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
