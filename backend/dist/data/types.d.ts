export interface UserBody {
    username: string;
    password: string;
}
export interface JwtResponse {
    success: boolean;
    token?: string;
}
export interface UserItem {
    pk: string;
    sk: string;
    username: string;
    password: string;
    accessLevel: 'user' | 'admin';
}
//# sourceMappingURL=types.d.ts.map