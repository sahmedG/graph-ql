import router from "./router.js";
import homeHandler from "./home.js";
import loginHandler from "./login.js";
import * as network from "./network.js";
import { isPossiblyLoggedIn } from "./helpers.js";
document.addEventListener('DOMContentLoaded', () => {
    router.addRoute('/', homeHandler);
    router.addRoute('/login', loginHandler);
    router.addRoute('/logout', async () => {
        if (!isPossiblyLoggedIn()) {
            router.navigateTo('/login');
            return;
        }
        await network.logout();
        router.navigateTo('/login', true);
    });
    router.navigateTo('/', false);
});
//# sourceMappingURL=index.js.map