import * as network from "./network.js";
import Navbar from "./navbar.js";
import router from "./router.js";

export default function loginHandler() {
    // to center the form
    const formContainer = document.createElement('div');
    formContainer.style.display = 'flex';
    formContainer.style.justifyContent = 'center';
    formContainer.style.alignItems = 'center';
    formContainer.style.height = '100%';

    formContainer.append(loginForm());


    document.body.append(
        Navbar(), 
        formContainer
    );
}



function loginForm(): HTMLElement {
    const form = document.createElement('form');
    form.id = 'login-form';

    const title = document.createElement('h1');
    title.innerText = 'Login';

    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.name = 'username';
    usernameInput.placeholder = 'username/email';
    usernameInput.required = true;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.placeholder = 'a secure password';
    passwordInput.required = true;

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.innerText = 'Login';


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (submitButton.disabled) {
            return;
        }

        submitButton.disabled = true;
        submitButton.innerText = 'Logging in...';

        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        network.login(username, password)
            .then(() => {
                router.navigateTo('/');
            })
            .catch((error) => {
                alert(error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerText = 'Login';
            });
    });

    form.append(
        title,
        usernameInput,
        passwordInput,
        submitButton
    );
    return form 
}