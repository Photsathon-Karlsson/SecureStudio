// Define request/response & DB item shapes

// Body for /api/register & /api/login
export interface UserBody {
  username: string;   
  password: string;   
}

// Response from backend when sending JWT back
export interface JwtResponse {
  success: boolean;    // true if login/register works
  token?: string;      // optional JWT token (might be missing if it failed)
}

// Item stored in DynamoDB 'jwt' table
export interface UserItem {
  pk: string;                 // USER
  sk: string;                 // USER#<uuid>
  username: string;           // login name
  password: string;           // password 
  accessLevel: 'user' | 'admin'; // role for permissions
}
