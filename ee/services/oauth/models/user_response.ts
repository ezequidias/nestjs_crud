export default interface UserResponse {
    userSSOId: string;
    firstName?: string;
    lastName?: string;
    email: string;
    domain?: string;
    sso: string;
}