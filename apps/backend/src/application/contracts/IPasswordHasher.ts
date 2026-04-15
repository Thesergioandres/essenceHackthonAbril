export interface IPasswordHasher {
  hash(rawPassword: string): Promise<string>;
  compare(rawPassword: string, passwordHash: string): Promise<boolean>;
}
