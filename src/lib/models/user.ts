import { z } from 'zod';
import { ZClass } from './zod-utils';

export const userSchema = z.object({
    avatar_url: z.string().describe(`URL of the user's profile picture (AKA avatar).`),
    html_url: z.string().describe(`URL the user's profile.`),
    id: z.number().describe(`The user's ID.`),
    login: z.string().describe(`The user's username.`),
    name: z.string().describe(`The user's full name.`),
});

export class User extends ZClass<User>()(userSchema) {
    /**
     * Deserialize, validate, and construct an instance of this model.
     * @param data The raw data.
     * @returns An instance of this model.
     */
    public static parse = (data: unknown): User => new User(userSchema.parse(data));
}
