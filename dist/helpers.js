export function isPossiblyLoggedIn() {
    return localStorage.getItem('hasura-jwt') !== null;
}
// https://stackoverflow.com/a/46188039/16619237
export function parseJwt() {
    const token = localStorage.getItem('hasura-jwt') || '';
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const json = JSON.parse(jsonPayload);
    return {
        userId: json['https://hasura.io/jwt/claims']['x-hasura-user-id'],
    };
}
export function getLastSlug(path) {
    const parts = path.split('/').filter(part => part.trim() !== ''); // Split the path by '/' and remove empty parts
    return parts.length > 0 ? parts[parts.length - 1] : ''; // Return the last part of the path
}
export function getRandomItem(arr) {
    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);
    // get random item
    const item = arr[randomIndex];
    return item;
}
//# sourceMappingURL=helpers.js.map